// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import type { Diagram } from "../../types/DiagramCatalog";
import type { GroupData } from "../../components/shapes/Group";
import type { ConnectPointData } from "../../components/shapes/ConnectPoint";
import type { CanvasHooksProps } from "../SvgCanvasTypes";

// Import functions related to SvgCanvas.
import { deepCopy } from "../../utils/Util";
import { newId } from "../../utils/Diagram";
import {
	isItemableData,
	isSelectableData,
	isConnectableData,
} from "../../utils/TypeUtils";
import { calcGroupBoxOfNoRotation } from "../../components/shapes/Group";
import { MULTI_SELECT_GROUP } from "../SvgCanvasConstants";

/**
 * 図形をペーストする際の移動量を計算
 * @param x 元の座標
 * @param offsetX 移動量
 * @returns 移動後の座標
 */
const applyOffset = (x: number, offset: number): number => {
	return x + offset;
};

/**
 * 図形とその子要素に対して再帰的に新しいIDを割り当てる
 * グループ階層を考慮して選択状態を設定する
 *
 * @param item ペーストする図形
 * @param isTopLevel この図形が最上位かどうか
 * @param isMultiSelect 複数選択モードかどうか
 * @param offsetX X座標の移動量
 * @param offsetY Y座標の移動量
 * @returns 新しいIDが割り当てられた図形
 */
const assignNewIdsRecursively = (
	item: Diagram,
	isTopLevel: boolean,
	isMultiSelect: boolean,
	offsetX: number,
	offsetY: number,
): Diagram => {
	const newItem = {
		...item,
		id: newId(),
	};

	// 座標を移動
	if ("x" in newItem && "y" in newItem) {
		newItem.x = applyOffset(newItem.x as number, offsetX);
		newItem.y = applyOffset(newItem.y as number, offsetY);
	}

	// 選択可能な要素の場合の選択状態設定
	if (isSelectableData(newItem)) {
		if (isMultiSelect) {
			// 複数選択モードの場合
			newItem.isSelected = true;
			newItem.isMultiSelectSource = true;
		} else {
			// 単一選択モード
			// 最上位の場合のみisSelectedをtrueにする
			newItem.isSelected = isTopLevel;
			newItem.isMultiSelectSource = false;
		}
	}

	// 接続ポイントを持つ場合は接続ポイントも移動
	if (isConnectableData(newItem)) {
		if (newItem.connectPoints) {
			newItem.connectPoints = newItem.connectPoints.map((connectPoint) => ({
				...connectPoint,
				id: newId(), // 接続ポイントにも新しいIDを割り当てる
				x: applyOffset(connectPoint.x, offsetX),
				y: applyOffset(connectPoint.y, offsetY),
			})) as ConnectPointData[];
		}
	}

	// グループやPath等の子アイテムを持つ要素の場合、子要素にも再帰的にIDを割り当てる
	if (isItemableData(newItem)) {
		newItem.items = newItem.items.map((childItem) =>
			// 子要素は常に最上位ではない
			assignNewIdsRecursively(
				childItem,
				false,
				isMultiSelect,
				offsetX,
				offsetY,
			),
		);
	}

	return newItem;
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
					const clipboardData = JSON.parse(clipboardText) as Diagram[];

					if (!Array.isArray(clipboardData) || clipboardData.length === 0) {
						console.error("Invalid clipboard data format");
						return;
					}

					// Deep copy the clipboard items to avoid reference issues
					const newItems = deepCopy(clipboardData);

					// 複数選択モードかどうか判定
					const isMultiSelect = newItems.length > 1;

					// ペーストする際の移動量
					const offsetX = 20;
					const offsetY = 20;

					// Assign new IDs to the pasted items and slightly offset their position
					const pastedItems = newItems.map((item) => {
						// 再帰的にIDを割り当て、アイテムが最上位であることを指定
						// 同時に座標を少しずらす
						return assignNewIdsRecursively(
							item,
							true,
							isMultiSelect,
							offsetX,
							offsetY,
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

						// 全ペーストアイテムを追加した後の状態
						const allItems = [...updatedItems, ...pastedItems];

						// 複数選択時のmultiSelectGroupの設定
						let multiSelectGroup: GroupData | undefined = undefined;
						if (isMultiSelect) {
							// マルチセレクトグループの作成
							const box = calcGroupBoxOfNoRotation(pastedItems);
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
								items: pastedItems.map((item) => ({
									...item,
									isSelected: false, // マルチセレクトグループ内ではfalse
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
