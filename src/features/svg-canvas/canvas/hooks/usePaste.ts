// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import type { ConnectLineData } from "../../components/shapes/ConnectLine";
import type { ConnectPointData } from "../../components/shapes/ConnectPoint";
import type { GroupData } from "../../components/shapes/Group";
import type { Diagram } from "../../types/DiagramCatalog";
import type { Shape } from "../../types/DiagramTypes";
import type { CanvasHooksProps } from "../SvgCanvasTypes";

// Import functions related to SvgCanvas.
import { calcGroupBoxOfNoRotation } from "../../components/shapes/Group";
import { newId } from "../../utils/Diagram";
import {
	isConnectableData,
	isItemableData,
	isSelectableData,
} from "../../utils/TypeUtils";
import { MULTI_SELECT_GROUP } from "../SvgCanvasConstants";
import { getDiagramById } from "../SvgCanvasFunctions";

/**
 * 図形をペーストする際の移動量
 */
const PASTE_OFFSET = 20;

/**
 * 図形をペーストする際の座標を計算
 * @param x 元の座標
 * @returns 移動後の座標
 */
const applyOffset = (x: number): number => {
	return x + PASTE_OFFSET;
};

/**
 * 旧IDと新IDのマッピングを追跡するためのマップを作成する型
 */
type IdMap = { [oldId: string]: string };

/**
 * 図形の座標を移動する
 * @param item 移動する図形
 * @returns 移動後の図形
 */
const applyOffsetToItem = (item: Diagram): Diagram => {
	const newItem = { ...item };

	// 座標を持つ要素の場合は移動
	if ("x" in newItem && "y" in newItem) {
		newItem.x = applyOffset(newItem.x as number);
		newItem.y = applyOffset(newItem.y as number);
	}

	// 接続ポイントを持つ場合は接続ポイントも移動
	if (isConnectableData(newItem) && newItem.connectPoints) {
		newItem.connectPoints = newItem.connectPoints.map((connectPoint) => ({
			...connectPoint,
			x: applyOffset(connectPoint.x),
			y: applyOffset(connectPoint.y),
		})) as ConnectPointData[];
	}

	return newItem;
};

/**
 * 図形の選択状態を設定する
 * @param item 対象の図形
 * @param isTopLevel この図形が最上位かどうか
 * @param isMultiSelect 複数選択モードかどうか
 * @returns 選択状態が設定された図形
 */
const setSelectionState = (
	item: Diagram,
	isTopLevel: boolean,
	isMultiSelect: boolean,
): Diagram => {
	const newItem = { ...item };

	if (isSelectableData(newItem)) {
		if (isMultiSelect) {
			// 複数選択モードの場合
			if (isTopLevel) {
				// 最上位のアイテムのみisSelectedをtrueにする
				// これにより、複数選択時でも最上位のグループのみが選択状態になる
				newItem.isSelected = true;
				newItem.isMultiSelectSource = true;
			} else {
				// 子要素は非選択状態にする
				newItem.isSelected = false;
				newItem.isMultiSelectSource = true;
			}
		} else {
			// 単一選択モード
			// 最上位の場合のみisSelectedをtrueにする
			newItem.isSelected = isTopLevel;
			newItem.isMultiSelectSource = false;
		}
	}

	return newItem;
};

/**
 * 図形と接続ポイントに新しいIDを割り当てる
 * @param item 対象の図形
 * @param idMap 旧IDと新IDのマッピング (オプション)
 * @returns 新しいIDが割り当てられた図形
 */
const assignNewIds = (item: Diagram, idMap?: IdMap): Diagram => {
	const newItemId = newId();

	// IDのマッピングを記録
	if (idMap) {
		idMap[item.id] = newItemId;
	}

	const newItem = {
		...item,
		id: newItemId,
	};

	// 接続ポイントを持つ場合は接続ポイントにも新しいIDを割り当てる
	if (isConnectableData(newItem) && newItem.connectPoints) {
		newItem.connectPoints = newItem.connectPoints.map((connectPoint) => {
			const connectPointNewId = newId();

			// 接続ポイントのIDもマッピングに追加
			if (idMap) {
				idMap[connectPoint.id] = connectPointNewId;
			}

			return {
				...connectPoint,
				id: connectPointNewId,
			};
		}) as ConnectPointData[];
	}

	return newItem;
};

/**
 * 図形とその子要素に対して再帰的に処理を行う
 * - 新しいIDの割り当て
 * - 座標の移動
 * - 選択状態の設定
 *
 * @param item ペーストする図形
 * @param isTopLevel この図形が最上位かどうか
 * @param isMultiSelect 複数選択モードかどうか
 * @param idMap 旧IDと新IDのマッピング (オプション)
 * @returns 処理後の図形
 */
const processDiagramForPasteRecursively = (
	item: Diagram,
	isTopLevel: boolean,
	isMultiSelect: boolean,
	idMap?: IdMap,
): Diagram => {
	// 各機能を順番に適用
	let newItem = assignNewIds(item, idMap);
	newItem = applyOffsetToItem(newItem);
	newItem = setSelectionState(newItem, isTopLevel, isMultiSelect);

	// グループやPath等の子アイテムを持つ要素の場合、子要素にも再帰的に処理を適用
	if (isItemableData(newItem)) {
		newItem.items = newItem.items.map((childItem) =>
			// 子要素は常に最上位ではない
			processDiagramForPasteRecursively(childItem, false, isMultiSelect, idMap),
		);
	}

	return newItem;
};

/**
 * 接続線のペースト処理
 * 接続元・接続先のIDを新しいIDに更新し、パスポイントにはオフセットを適用する
 *
 * @param connectLine ペーストする接続線
 * @param idMap 旧IDと新IDのマッピング
 * @param items ペースト後のアイテム全体
 * @returns 更新後の接続線
 */
const processConnectLineForPaste = (
	connectLine: ConnectLineData,
	idMap: IdMap,
	items: Diagram[],
): ConnectLineData | null => {
	// 両端の接続先が含まれているか確認
	const newStartOwnerId = idMap[connectLine.startOwnerId];
	const newEndOwnerId = idMap[connectLine.endOwnerId];

	// 両端が含まれていない場合はnullを返す
	if (!newStartOwnerId || !newEndOwnerId) {
		return null;
	}

	// 新しい接続先図形を取得
	const startOwner = getDiagramById(items, newStartOwnerId) as Shape;
	const endOwner = getDiagramById(items, newEndOwnerId) as Shape;

	// 接続先が見つからない場合はnullを返す
	if (!startOwner || !endOwner) {
		return null;
	}

	// 接続線の新しいIDを生成
	const newConnectLineId = newId();

	// 新しい接続線オブジェクトを作成
	const newConnectLine: ConnectLineData = {
		...connectLine,
		id: newConnectLineId,
		x: applyOffset(connectLine.x),
		y: applyOffset(connectLine.y),
		startOwnerId: newStartOwnerId,
		endOwnerId: newEndOwnerId,
		isSelected: false, // ペーストした接続線は非選択状態に
		// パスポイントを更新（単純にオフセットを適用）
		items: connectLine.items.map((point, index) => {
			// 新しいIDを割り当てる
			let pointId: string;
			if (index === 0 || index === connectLine.items.length - 1) {
				// 両端のポイントの場合、IDのマッピングがあれば使用
				pointId = idMap[point.id] || newId();
			} else {
				pointId = newId();
			}

			return {
				...point,
				id: pointId,
				x: applyOffset(point.x),
				y: applyOffset(point.y),
			};
		}),
	};

	return newConnectLine;
};

/**
 * Custom hook to handle paste events on the canvas.
 */
export const usePaste = (props: CanvasHooksProps) => {
	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	return useCallback(() => {
		// Bypass references to avoid function creation in every render.
		const { setCanvasState } = refBus.current.props;

		// Read data from clipboard
		navigator.clipboard
			.readText()
			.then((clipboardText) => {
				try {
					// Parse the clipboard data
					const newItems = JSON.parse(clipboardText) as Diagram[];

					if (!Array.isArray(newItems) || newItems.length === 0) {
						console.error("Invalid clipboard data format");
						return;
					}

					// 接続線と通常の図形を分離
					const connectLines = newItems.filter(
						(item) => item.type === "ConnectLine",
					) as ConnectLineData[];
					const normalItems = newItems.filter(
						(item) => item.type !== "ConnectLine",
					);

					// 複数選択モードかどうか判定（接続線を除く）
					const isMultiSelect = normalItems.length > 1;

					// 古いIDと新しいIDのマッピングを保持
					const idMap: IdMap = {};

					// Assign new IDs to the pasted items and slightly offset their position
					const pastedNormalItems = normalItems.map((item) => {
						// 再帰的にIDを割り当て、アイテムが最上位であることを指定
						// 同時に座標を少しずらす
						return processDiagramForPasteRecursively(
							item,
							true,
							isMultiSelect,
							idMap,
						);
					});

					// Update the canvas state with the pasted items
					setCanvasState((prevState) => {
						// Deselect all existing items
						const updatedItems = prevState.items.map((item) => {
							if (isSelectableData(item)) {
								return {
									...item,
									isSelected: false,
									isMultiSelectSource: false,
								};
							}
							return item;
						});

						// 全ペーストアイテムを追加
						let allItems = [...updatedItems, ...pastedNormalItems];

						// 接続線のペースト処理
						if (connectLines.length > 0) {
							// 接続線を処理（接続元と接続先の更新・座標の再計算）
							const pastedConnectLines = connectLines
								.map((connectLine) =>
									processConnectLineForPaste(connectLine, idMap, [
										...updatedItems,
										...pastedNormalItems,
									]),
								)
								.filter((line): line is ConnectLineData => line !== null);

							// 処理された接続線を追加
							allItems = [...allItems, ...pastedConnectLines];
						}

						// 複数選択時のmultiSelectGroupの設定
						let multiSelectGroup: GroupData | undefined = undefined;
						if (isMultiSelect) {
							// マルチセレクトグループの作成
							const box = calcGroupBoxOfNoRotation(pastedNormalItems);
							multiSelectGroup = {
								id: MULTI_SELECT_GROUP,
								type: "Group",
								x: box.left + (box.right - box.left) / 2,
								y: box.top + (box.bottom - box.top) / 2,
								width: box.right - box.left,
								height: box.bottom - box.top,
								rotation: 0,
								scaleX: 1,
								scaleY: 1,
								keepProportion:
									prevState.multiSelectGroup?.keepProportion ?? true,
								isSelected: true,
								isMultiSelectSource: false,
								items: pastedNormalItems.map((item) => ({
									...item,
									isSelected: false, // マルチセレクトグループ内ではfalse
									isMultiSelectSource: false, // useSelectAll.tsと同様に設定する
								})),
							} as GroupData;
						}

						// Add the pasted items to the canvas
						return {
							...prevState,
							items: allItems,
							isDiagramChanging: false,
							multiSelectGroup,
						};
					});
				} catch (error) {
					console.error("Error while pasting items from clipboard:", error);
				}
			})
			.catch((err) => {
				console.error("Failed to read clipboard contents:", err);
			});
	}, []);
};
