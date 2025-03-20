// Reactのインポート
import { useCallback, useState } from "react";

// 型定義をインポート
import type { PartiallyRequired } from "../../../../types/ParticallyRequired";

// SvgCanvas関連型定義をインポート
import type {
	ConnectLineData,
	Diagram,
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

// SvgCanvas関連関数をインポート
import { isItemableData, isSelectableData, newId } from "../functions/Diagram";
import { calcPointsOuterBox } from "../functions/Math";

/**
 * SvgCanvasの状態の型定義
 */
export type SvgCanvasState = {
	items: Diagram[];
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

	const onTransform = useCallback((e: DiagramTransformEvent) => {
		setCanvasState((prevState) => ({
			...prevState,
			items: applyRecursive(prevState.items, (item) =>
				item.id === e.id ? { ...item, ...e.endShape } : item,
			),
		}));
	}, []);

	const onItemableChange = useCallback((e: ItemableChangeEvent) => {
		setCanvasState((prevState) => ({
			...prevState,
			items: applyRecursive(prevState.items, (item) =>
				item.id === e.id ? deepMerge(item, e) : item,
			),
		}));

		// 接続ポイントの移動を通知
		const connectPoints: ConnectPointMoveData[] = [];
		const findRecursive = (data: Partial<Diagram>) => {
			if (isItemableData(data)) {
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

		notifyConnectPointsMove({
			eventType: e.eventType,
			points: connectPoints,
		});
	}, []);

	const onDrag = useCallback((e: DiagramDragEvent) => {
		setCanvasState((prevState) => ({
			...prevState,
			items: applyRecursive(prevState.items, (item) =>
				item.id === e.id ? { ...item, x: e.endX, y: e.endY } : item,
			),
		}));
	}, []);

	const onDrop = useCallback((_e: DiagramDragDropEvent) => {
		// NOP
	}, []);

	const onSelect = useCallback((e: DiagramSelectEvent) => {
		setCanvasState((prevState) => {
			const items = applyRecursive(prevState.items, (item) => {
				if (!isSelectableData(item)) {
					return item;
				}
				return item.id === e.id
					? { ...item, isSelected: true }
					: { ...item, isSelected: e.isMultiSelect ? item.isSelected : false };
			});

			return {
				...prevState,
				items,
				selectedItemId: e.id,
			};
		});
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
					// 接続線の方の座標はnotifyConnectPointsMoveで更新されるのでここでは更新しない
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
