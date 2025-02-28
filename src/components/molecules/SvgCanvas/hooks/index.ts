// Reactのインポート
import { useState, useCallback } from "react";

// 型定義をインポート
import type { PartiallyRequired } from "../../../../types/ParticallyRequired";

// SvgCanvas関連型定義をインポート
import type {
	ConnectPointData,
	Diagram,
	LineData,
	LinePointData,
} from "../types/DiagramTypes";
import type {
	DiagramSelectEvent,
	DiagramDragEvent,
	DiagramResizeEvent,
	DiagramDragDropEvent,
	DiagramConnectEvent,
	ConnectPointMoveEvent,
} from "../types/EventTypes";

// SvgCanvas関連関数をインポート
import { isGroupData } from "../SvgCanvasFunctions";

// ユーティリティをインポート
import { getLogger } from "../../../../utils/Logger";

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

	const onDiagramDrag = useCallback((e: DiagramDragEvent) => {
		// setCanvasState((prevState) => ({
		// 	...prevState,
		// 	items: applyRecursive(prevState.items, (item) =>
		// 		item.id === e.id ? { ...item, point: e.endPoint } : item,
		// 	),
		// }));
	}, []);

	const onDiagramDragEnd = useCallback((e: DiagramDragEvent) => {
		logger.debug("onDiagramDragEnd", e);
		setCanvasState((prevState) => ({
			...prevState,
			items: applyRecursive(prevState.items, (item) =>
				item.id === e.id ? { ...item, point: e.endPoint } : item,
			),
		}));
	}, []);

	const onDiagramDrop = useCallback((e: DiagramDragDropEvent) => {
		// NOP
	}, []);

	const onDiagramResizing = useCallback((e: DiagramResizeEvent) => {
		logger.debug("onDiagramResizing", e);
		// TODO: リサイズ中の処理
	}, []);

	const onDiagramResizeEnd = useCallback((e: DiagramResizeEvent) => {
		logger.debug("onDiagramResizeEnd", e);
		setCanvasState((prevState) => ({
			...prevState,
			items: applyRecursive(prevState.items, (item) =>
				item.id === e.id ? { ...item, ...e } : item,
			),
		}));
	}, []);

	const onDiagramSelect = useCallback((e: DiagramSelectEvent) => {
		setCanvasState((prevState) => {
			const items = applyRecursive(prevState.items, (item) =>
				item.id === e.id
					? { ...item, isSelected: true }
					: { ...item, isSelected: false },
			);

			return {
				...prevState,
				items,
				selectedItemId: e.id,
			};
		});
	}, []);

	const onDiagramConnect = useCallback(
		(e: DiagramConnectEvent) => {
			// alert("connect");
			const startItem = getDiagramById(canvasState.items, e.startPoint.id);
			const endItem = getDiagramById(canvasState.items, e.endPoint.id);
			addItem({
				id: generateId(),
				type: "Line",
				point: startItem?.point ?? { x: 0, y: 0 },
				width: 100,
				height: 100,
				keepProportion: false,
				isSelected: false,
				items: [
					{
						id: e.startPoint.id,
						type: "LinePoint",
						point: startItem?.point ?? { x: 0, y: 0 },
						width: 0,
						height: 0,
						keepProportion: false,
						isSelected: false,
					},
					{
						id: e.endPoint.id,
						type: "LinePoint",
						point: endItem?.point ?? { x: 0, y: 0 },
						width: 0,
						height: 0,
						keepProportion: false,
						isSelected: false,
					},
				] as Diagram[],
			});
		},
		[canvasState.items],
	);

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
		onDiagramDrag,
		onDiagramDragEnd,
		onDiagramDragEndByGroup: onDiagramDragEnd,
		onDiagramDrop,
		onDiagramResizing,
		onDiagramResizeEnd,
		onDiagramSelect,
		onDiagramConnect,
		onConnectPointMove,
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

	return {
		state: [canvasState, setCanvasState],
		canvasProps,
		canvasFunctions,
	} as const;
};
