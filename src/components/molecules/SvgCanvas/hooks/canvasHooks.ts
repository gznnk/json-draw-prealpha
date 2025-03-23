// Reactのインポート
import { useCallback, useState } from "react";

// 型定義をインポート
import type { PartiallyRequired } from "../../../../types/ParticallyRequired";

// SvgCanvas関連型定義をインポート
import type {
	ConnectLineData,
	Diagram,
	GroupData,
	PathPointData,
} from "../types/DiagramTypes";
import type {
	ConnectPointMoveData,
	ConnectPointsMoveEvent,
	DiagramConnectEvent,
	DiagramDragDropEvent,
	DiagramDragEvent,
	DiagramSelectEvent,
	DiagramTransformEvent,
	ItemableChangeEvent,
} from "../types/EventTypes";

// SvgCanvas関連コンポーネントをインポート
import { notifyConnectPointsMove } from "../components/connector/ConnectLine";
import { calcGroupBoxOfNoRotation } from "../components/diagram/Group";

// SvgCanvas関連関数をインポート
import { isItemableData, isSelectableData, newId } from "../functions/Diagram";
import { calcPointsOuterBox } from "../functions/Math";

/**
 * SvgCanvasの状態の型定義
 */
export type SvgCanvasState = {
	items: Diagram[];
	multiSelectGroup?: GroupData;
	selectedItemId?: string;
};

// TODO: 精査
type UpdateItem = Omit<PartiallyRequired<Diagram, "id">, "type" | "isSelected">;

/**
 * SVGキャンバスのフック
 *
 * @param initialItems 初期図形配列
 * @returns キャンバスの状態と関数
 */
export const useSvgCanvas = (initialItems: Diagram[]) => {
	const [canvasState, setCanvasState] = useState<SvgCanvasState>({
		items: initialItems,
	});

	/**
	 * 図形のドラッグイベントハンドラ
	 */
	const onDrag = useCallback((e: DiagramDragEvent) => {
		setCanvasState((prevState) => ({
			...prevState,
			items: applyRecursive(prevState.items, (item) =>
				item.id === e.id ? { ...item, x: e.endX, y: e.endY } : item,
			),
		}));
	}, []);

	/**
	 * 図形のドロップイベントハンドラ
	 */
	const onDrop = useCallback((_e: DiagramDragDropEvent) => {
		// NOP
	}, []);

	/**
	 * 図形の変形イベントハンドラ
	 */
	const onTransform = useCallback((e: DiagramTransformEvent) => {
		setCanvasState((prevState) => ({
			...prevState,
			items: applyRecursive(prevState.items, (item) =>
				item.id === e.id ? { ...item, ...e.endShape } : item,
			),
		}));
	}, []);

	/**
	 * 子図形をもつ図形の変更イベントハンドラ
	 */
	const onItemableChange = useCallback((e: ItemableChangeEvent) => {
		// 接続ポイントの移動データを取得
		const connectPoints: ConnectPointMoveData[] = [];
		const findRecursive = (data: Partial<Diagram>) => {
			if (isItemableData(data) && !data.isMultiSelected) {
				for (const item of data.items ?? []) {
					if (item.type === "ConnectPoint") {
						connectPoints.push({
							id: item.id,
							x: item.x,
							y: item.y,
							ownerId: data.id,
							ownerShape: {
								...data,
							},
						});
					}
					if (isItemableData(item)) {
						findRecursive(item);
					}
				}
			}
		};
		findRecursive(e);

		if (0 < connectPoints.length) {
			// 接続ポイントの移動を通知
			notifyConnectPointsMove({
				eventType: e.eventType,
				points: connectPoints,
			});
		}

		// 図形の変更を反映
		setCanvasState((prevState) => {
			let items = prevState.items;
			let multiSelectGroup: GroupData | undefined = prevState.multiSelectGroup;

			if (e.id === "MultiSelectGroup") {
				// 複数選択グループの変更の場合、複数選択グループ内の図形を更新
				multiSelectGroup = {
					...multiSelectGroup,
					...e,
				} as GroupData;

				// // 複数選択グループの変更が終了したタイミングで、元の図形にも変更を反映する
				if (e.eventType === "End") {
					items = applyRecursive(prevState.items, (item) => {
						// 元図形に対応する複数選択グループ側の変更データを取得
						const changedItem = (e.items ?? []).find((i) => i.id === item.id);
						if (changedItem && isSelectableData(item)) {
							const newItem = {
								...item,
								...changedItem,
								isSelected: item.isSelected, // 元図形の選択状態を維持（これをやらないとchangeItem側の値で上書きされてしまう）
								isMultiSelected: item.isMultiSelected, // 元図形の非表示を維持（同上）
							};
							if (isItemableData(newItem)) {
								newItem.items = applyMultiSelectRecursive(
									newItem.items ?? [],
									item.isMultiSelected,
								); // 子図形の非表示を維持（同上）
							}

							return newItem;
						}

						// 対応する変更データがない場合はそのまま
						return item;
					});
				}
			} else {
				// 複数選択グループ以外の場合は、普通に更新
				items = applyRecursive(prevState.items, (item) =>
					item.id === e.id ? { ...item, ...e } : item,
				);
			}

			return {
				...prevState,
				items,
				multiSelectGroup,
			};
		});
	}, []);

	/**
	 * 図形の選択イベントハンドラ
	 */
	const onSelect = useCallback((e: DiagramSelectEvent) => {
		setCanvasState((prevState) => {
			let items = applyRecursive(prevState.items, (item) => {
				if (!isSelectableData(item)) {
					// 選択不可能な図形は無視
					return item;
				}

				if (item.id === e.id) {
					// 図形を選択状態にする
					return { ...item, isSelected: true };
				}

				return {
					...item,
					// 複数選択でない場合は、選択された図形以外の選択状態を解除
					isSelected: e.isMultiSelect ? item.isSelected : false,
				};
			});

			// 選択されたアイテムを取得
			const selectedItems = getSelectedRecursive(items);

			// 複数選択の場合は、選択されている図形をグループ化
			let multiSelectGroup: GroupData | undefined = undefined;
			if (1 < selectedItems.length) {
				// 複数選択グループの初期値を作成
				const box = calcGroupBoxOfNoRotation(selectedItems);
				multiSelectGroup = {
					x: box.left + (box.right - box.left) / 2,
					y: box.top + (box.bottom - box.top) / 2,
					width: box.right - box.left,
					height: box.bottom - box.top,
					rotation: 0,
					scaleX: 1,
					scaleY: 1,
					keepProportion: false,
					isSelected: true, // 複数選択用のグループは常に選択状態にする
					isMultiSelected: false, // 複数選択用のグループ側は複数選択状態を常に解除し、通常どおり動くようにする
					items: applyRecursive(selectedItems, (item) => {
						if (!isSelectableData(item)) {
							return item;
						}
						return {
							...item,
							isSelected: false, // 複数選択用のグループ内の図形は選択状態を解除
							isMultiSelected: false, // 複数選択用のグループ内の図形は複数選択状態を解除し、通常どおり動くようにする
						};
					}),
				} as GroupData;

				// 元の図形は非表示にする
				items = applyMultiSelectRecursive(items, false);
			}

			console.log({
				...prevState,
				items,
				multiSelectGroup,
			});

			return {
				...prevState,
				items,
				multiSelectGroup,
				selectedItemId: e.id,
			};
		});
	}, []);

	/**
	 * 選択状態の全解除イベントハンドラ
	 */
	const onAllSelectionClear = useCallback(() => {
		setCanvasState((prevState) => ({
			...prevState,
			items: applyRecursive(prevState.items, (item) =>
				isSelectableData(item)
					? { ...item, isSelected: false, isMultiSelected: false } // 全ての図形の選択状態を解除し、かつ表示状態を元に戻す
					: item,
			),
			multiSelectGroup: undefined,
			selectedItemId: undefined,
		}));
	}, []);

	const onDelete = useCallback(() => {
		setCanvasState((prevState) => {
			const items = applyRecursive(prevState.items, (item) => {
				if (!isSelectableData(item)) {
					return item;
				}
				item.items = item.items?.filter(
					(i) => !isSelectableData(i) || !i.isSelected,
				);
				return item;
			}).filter((item) => !isSelectableData(item) || !item.isSelected);

			return {
				...prevState,
				items,
			};
		});
	}, []);

	const onConnect = useCallback((e: DiagramConnectEvent) => {
		const box = calcPointsOuterBox(e.points.map((p) => ({ x: p.x, y: p.y })));

		addItem({
			id: newId(),
			type: "ConnectLine",
			x: box.center.x,
			y: box.center.y,
			width: box.right - box.left,
			height: box.bottom - box.top,
			isSelected: false,
			keepProportion: false,
			items: e.points.map((p) => ({
				...p,
				type: "PathPoint",
			})) as PathPointData[],
			startOwnerId: e.startOwnerId,
			endOwnerId: e.endOwnerId,
		} as ConnectLineData);
	}, []);

	const onConnectPointsMove = useCallback((e: ConnectPointsMoveEvent) => {
		setCanvasState((prevState) => ({
			...prevState,
			items: applyRecursive(prevState.items, (item) => {
				if (item.type === "ConnectLine") {
					// 接続線の方の座標は最後のnotifyConnectPointsMoveで更新されるのでここでは更新しない
					return item;
				}
				const newPoint = e.points.find((p) => p.id === item.id);
				if (newPoint) {
					return { ...item, x: newPoint.x, y: newPoint.y };
				}
				return item;
			}),
		}));

		notifyConnectPointsMove(e);
	}, []);

	const canvasProps = {
		...canvasState,
		onDrag,
		onDrop,
		onSelect,
		onAllSelectionClear,
		onDelete,
		onConnect,
		onConnectPointsMove,
		onTransform,
		onItemableChange,
	};

	const getSelectedItem = useCallback(() => {
		let selectedItem: Diagram | undefined;
		const findSelectedItem = (items: Diagram[]) => {
			for (const item of items) {
				if (isSelectableData(item) && item.isSelected) {
					selectedItem = item;
				}
				if (isItemableData(item)) {
					findSelectedItem(item.items ?? []);
				}
			}
		};
		findSelectedItem(canvasState.items);
		return selectedItem;
	}, [canvasState.items]);

	const addItem = useCallback((item: Diagram) => {
		setCanvasState((prevState) => ({
			...prevState,
			items: [
				...prevState.items.map((item) => ({ ...item, isSelected: false })),
				{
					...item,
				},
			],
		}));
	}, []);

	const updateItem = useCallback((item: UpdateItem) => {
		setCanvasState((prevState) => ({
			...prevState,
			items: applyRecursive(prevState.items, (i) =>
				i.id === item.id ? { ...i, ...item } : i,
			),
		}));
	}, []);

	const canvasFunctions = {
		getSelectedItem,
		addItem,
		updateItem,
	};

	return {
		state: [canvasState, setCanvasState],
		canvasProps,
		canvasFunctions,
	} as const;
};

/**
 * 再帰的に更新関数を適用する
 *
 * @param items 更新対象の図形配列
 * @param updateFunction 更新関数
 * @returns 更新後の図形配列
 */
const applyRecursive = (
	items: Diagram[],
	updateFunction: (item: Diagram) => Diagram,
) => {
	let isItemChanged = false;
	const newItems: Diagram[] = [];
	for (const item of items) {
		const newItem = updateFunction(item);
		newItems.push(newItem);

		// アイテムの参照先が変わった場合は変更ありと判断する
		if (item !== newItem) {
			isItemChanged = true;
		}
		if (isItemableData(item) && isItemableData(newItem)) {
			const newGroupItems = applyRecursive(item.items ?? [], updateFunction);
			// 配列の参照先が変わった場合は変更ありと判断する
			if (newGroupItems !== item.items) {
				newItem.items = newGroupItems;
				isItemChanged = true;
			}
		}
	}

	// 変更がない場合はReactが変更なしと検知するよう元の配列を返す
	return isItemChanged ? newItems : items;
};

// TODO: ちゃんと中身を見ていないので要確認
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const deepMerge = <T extends Record<string, any>>(
	target: T,
	...sources: Partial<T>[]
): T => {
	for (const source of sources) {
		if (typeof source !== "object" || source === null) continue;

		for (const key of Object.keys(source)) {
			const sourceValue = source[key];
			const targetValue = target[key];

			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			(target as any)[key] =
				typeof sourceValue === "object" && sourceValue !== null
					? deepMerge(
							Array.isArray(sourceValue) ? [] : { ...targetValue },
							sourceValue,
						)
					: sourceValue;
		}
	}

	return Array.isArray(target) ? target : { ...target };
};

const getSelectedRecursive = (items: Diagram[], selectedItems?: Diagram[]) => {
	const _selectedItems = selectedItems ?? [];
	for (const item of items) {
		if (isSelectableData(item)) {
			if (item.isSelected) {
				_selectedItems.push(item);
			} else if (isItemableData(item)) {
				getSelectedRecursive(item.items, _selectedItems);
			}
		}
	}
	return _selectedItems;
};

const applyMultiSelectRecursive = (
	items: Diagram[],
	isGroupMultiSelected: boolean,
): Diagram[] => {
	return items.map((item) => {
		const newItem = { ...item };
		if (!isSelectableData(newItem)) {
			return item;
		}
		newItem.isMultiSelected = isGroupMultiSelected || newItem.isSelected;
		if (isItemableData(newItem)) {
			newItem.items = applyMultiSelectRecursive(
				newItem.items ?? [],
				newItem.isMultiSelected,
			);
		}
		return newItem;
	});
};
