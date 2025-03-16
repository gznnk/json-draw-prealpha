// Reactのインポート
import { useState, useCallback, useEffect } from "react";

// 型定義をインポート
import type { PartiallyRequired } from "../../../../types/ParticallyRequired";

// SvgCanvas関連型定義をインポート
import type {
	ConnectPointData,
	Diagram,
	PathData,
	PathPointData,
} from "../types/DiagramTypes";
import type {
	DiagramSelectEvent,
	DiagramDragEvent,
	DiagramDragDropEvent,
	DiagramConnectEvent,
	ConnectPointMoveEvent,
	DiagramTransformEvent,
	GroupDataChangeEvent,
} from "../types/EventTypes";

// SvgCanvas関連関数をインポート
import { isGroupData } from "../SvgCanvasFunctions";

import { EVENT_NAME_CONNECT_POINT_MOVE } from "../components/connector/ConnectPoint";

// ユーティリティをインポート
import { getLogger } from "../../../../utils/Logger";
import { calcPointsOuterBox } from "../functions/Math";

const logger = getLogger("SvgCanvasHooks");

const getDiagramById = (
	diagrams: Diagram[],
	id: string,
): Diagram | undefined => {
	for (const diagram of diagrams) {
		if (diagram.id === id) {
			return diagram;
		}
		if (isGroupData(diagram)) {
			const ret = getDiagramById(diagram.items || [], id);
			if (ret) {
				return ret;
			}
		}
	}
};

// const getConnectPointById = (
// 	diagrams: Diagram[],
// 	id: string,
// ): ConnectPointData | undefined => {
// 	for (const diagram of diagrams) {
// 		if (isGroupData(diagram)) {
// 			const ret = getConnectPointById(diagram.items || [], id);
// 			if (ret) {
// 				return ret;
// 			}
// 		}
// 		const ret = diagram.connectPoints?.find((cp) => cp.id === id);
// 		if (ret) {
// 			return ret;
// 		}
// 	}
// };

const generateId = (): string => crypto.randomUUID();

function removeNulls<T extends object>(obj: T): Partial<T> {
	return Object.fromEntries(
		Object.entries(obj).filter(([_, value]) => value !== undefined),
	) as Partial<T>;
}

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

type SvgCanvasState = {
	items: Diagram[];
	selectedItemId?: string;
};

// type AddItem = Omit<PartiallyRequired<Diagram, "type">, "id" | "isSelected">;
type AddItem = Diagram;
type UpdateItem = Omit<PartiallyRequired<Diagram, "id">, "type" | "isSelected">;

const DEFAULT_ITEM_VALUE = {
	point: { x: 10, y: 10 },
	width: 100,
	height: 100,
	fill: "transparent",
	stroke: "black",
	strokeWidth: "1px",
	keepProportion: false,
	isSelected: false,
	childItems: [],
};

const applyRecursive = (items: Diagram[], func: (item: Diagram) => Diagram) => {
	let isItemChanged = false;
	const newItems: Diagram[] = [];
	for (const item of items) {
		const newItem = func(item);
		newItems.push(newItem);

		// アイテムの参照先が変わった場合は変更ありと判断する
		if (item !== newItem) {
			isItemChanged = true;
		}
		if (isGroupData(item) && isGroupData(newItem)) {
			const newGroupItems = applyRecursive(item.items ?? [], func);
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

/**
 * SVGキャンバスのフック
 *
 * @param initialItems
 * @returns
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

	const onGroupDataChange = useCallback((e: GroupDataChangeEvent) => {
		// console.log("onGroupDataChange", e);

		setCanvasState((prevState) => ({
			...prevState,
			items: applyRecursive(prevState.items, (item) =>
				item.id === e.id ? deepMerge(item, e) : item,
			),
		}));

		// setCanvasState((prevState) => ({
		// 	...prevState,
		// 	items: applyRecursive(prevState.items, (item) => {
		// 		console.log("", item.id);
		// 		if (item.id === e.id) {
		// 			return deepMerge(item, e);
		// 		}
		// 		return item;
		// 	}),
		// }));
	}, []);

	const onDrag = useCallback((e: DiagramDragEvent) => {
		setCanvasState((prevState) => ({
			...prevState,
			items: applyRecursive(prevState.items, (item) =>
				item.id === e.id ? { ...item, point: e.endPoint } : item,
			),
		}));
	}, []);

	const onDragEnd = useCallback((e: DiagramDragEvent) => {
		logger.debug("onDragEnd", e);
		setCanvasState((prevState) => ({
			...prevState,
			items: applyRecursive(prevState.items, (item) =>
				item.id === e.id ? { ...item, point: e.endPoint } : item,
			),
		}));
	}, []);

	const onDrop = useCallback((e: DiagramDragDropEvent) => {
		// NOP
	}, []);

	const onSelect = useCallback((e: DiagramSelectEvent) => {
		setCanvasState((prevState) => {
			const items = applyRecursive(prevState.items, (item) =>
				item.id === e.id
					? { ...item, isSelected: true }
					: { ...item, isSelected: e.isMultiSelect ? item.isSelected : false },
			);

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
				item.items = item.items?.filter((i) => !i.isSelected);
				return item;
			}).filter((item) => !item.isSelected);

			return {
				...prevState,
				items,
			};
		});
	}, []);

	const onConnect = useCallback((e: DiagramConnectEvent) => {
		// alert("connect");
		// const startItem = getDiagramById(canvasState.items, e.startPoint.id);
		// const endItem = getDiagramById(canvasState.items, e.endPoint.id);
		// console.log("onConnect", e);

		const box = calcPointsOuterBox(e.points.map((p) => p.point));

		addItem({
			id: generateId(),
			type: "ConnectLine",
			point: box.center,
			width: box.right - box.left,
			height: box.bottom - box.top,
			keepProportion: false,
			isSelected: false,
			items: e.points.map((p) => ({
				type: "PathPoint",
				...p,
				isSelected: false,
			})) as Diagram[],
		});
	}, []);

	useEffect(() => {
		const handleConnectPointMove = (e: Event) => {
			const event = e as CustomEvent<ConnectPointMoveEvent>;
			setCanvasState((prevState) => ({
				...prevState,
				items: applyRecursive(prevState.items, (item) =>
					item.id === event.detail.id //&& item.type !== "PathPoint"
						? { ...item, point: event.detail.point }
						: item,
				),
			}));
		};
		document.addEventListener(
			EVENT_NAME_CONNECT_POINT_MOVE,
			handleConnectPointMove,
		);

		return () => {
			document.removeEventListener(
				EVENT_NAME_CONNECT_POINT_MOVE,
				handleConnectPointMove,
			);
		};
	}, []);

	const canvasProps = {
		...canvasState,
		onDrag,
		onDragEnd,
		onDragEndByGroup: onDragEnd,
		onDrop,
		onSelect,
		onDelete,
		onConnect,
		onTransform,
		onGroupDataChange,
	};

	const getSelectedItem = useCallback(() => {
		let selectedItem: Diagram | undefined;
		const findSelectedItem = (items: Diagram[]) => {
			for (const item of items) {
				if (item.isSelected) {
					selectedItem = item;
				}
				if (isGroupData(item)) {
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

	// console.log("canvasState", canvasState);

	return {
		state: [canvasState, setCanvasState],
		canvasProps,
		canvasFunctions,
	} as const;
};
