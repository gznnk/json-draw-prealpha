// Reactのインポート
import { useState, useCallback } from "react";

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

	return target;
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
	return items.map((item) => {
		const newItem = func(item);
		if (isGroupData(item) && isGroupData(newItem)) {
			newItem.items = applyRecursive(item.items ?? [], func);
		}
		return newItem;
	});
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
		console.log("onConnect", e);

		const box = calcPointsOuterBox(e.points.map((p) => p.point));

		addItem({
			id: generateId(),
			type: "Path",
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

	const onConnectPointMove = useCallback((e: ConnectPointMoveEvent) => {
		//console.log("move");
		//console.log(e);
		setCanvasState((prevState) => ({
			...prevState,
			items: applyRecursive(prevState.items, (item) =>
				item.id === e.id ? { ...item, point: e.point } : item,
			),
		}));
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
		onConnectPointMove,
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
