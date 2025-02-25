// Reactのインポート
import { useState, useCallback } from "react";

// 型定義をインポート
import type { PartiallyRequired } from "../../../../types/ParticallyRequired";

// SvgCanvas関連型定義をインポート
import type { Diagram, GroupData } from "../types/DiagramTypes";
import type {
	ItemSelectEvent,
	DiagramDragEvent,
	DiagramResizeEvent,
} from "../types/EventTypes";

type SvgCanvasState = {
	items: Diagram[];
	selectedItemId?: string;
};

type AddItem = Omit<PartiallyRequired<Diagram, "type">, "id" | "isSelected">;
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
		if (item.type === "group") {
			(newItem as GroupData).items = applyRecursive(
				(item as GroupData).items ?? [],
				func,
			);
		}
		return newItem;
	});
};

export const useSvgCanvas = (initialItems: Diagram[]) => {
	const [canvasState, setCanvasState] = useState<SvgCanvasState>({
		items: initialItems,
	});

	const onDiagramDragEnd = useCallback((e: DiagramDragEvent) => {
		setCanvasState((prevState) => ({
			...prevState,
			items: applyRecursive(prevState.items, (item) =>
				item.id === e.id ? { ...item, point: e.new.point } : item,
			),
		}));
	}, []);

	const onDiagramResizeEnd = useCallback((e: DiagramResizeEvent) => {
		setCanvasState((prevState) => ({
			...prevState,
			items: applyRecursive(prevState.items, (item) =>
				item.id === e.id ? { ...item, ...e } : item,
			),
		}));
	}, []);

	const onItemSelect = useCallback((e: ItemSelectEvent) => {
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

	const canvasProps = {
		...canvasState,
		onDiagramDragEnd,
		onDiagramDragEndByGroup: onDiagramDragEnd,
		onDiagramResizeEnd,
		onItemSelect,
	};

	const getSelectedItem = useCallback(() => {
		let selectedItem: Diagram | undefined;
		const findSelectedItem = (items: Diagram[]) => {
			for (const item of items) {
				if (item.isSelected) {
					selectedItem = item;
				}
				if (item.type === "group") {
					findSelectedItem((item as GroupData).items ?? []);
				}
			}
		};
		findSelectedItem(canvasState.items);
		return selectedItem;
	}, [canvasState.items]);

	const addItem = useCallback((item: AddItem) => {
		setCanvasState((prevState) => ({
			...prevState,
			items: [
				...prevState.items.map((item) => ({ ...item, isSelected: false })),
				{
					...DEFAULT_ITEM_VALUE,
					id: String(prevState.items.length + 15),
					isSelected: true,
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
