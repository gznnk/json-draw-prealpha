import { useState, useCallback } from "react";
import type { Diagram, ItemSelectEvent, ChangeEvent } from "../types";
import type { PartiallyRequired } from "../../../../types/ParticallyRequired";

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

export const useSvgCanvas = (initialItems: Diagram[]) => {
	const [canvasState, setCanvasState] = useState<SvgCanvasState>({
		items: initialItems,
	});

	const onChangeEnd = useCallback((e: ChangeEvent) => {
		setCanvasState((prevState) => ({
			...prevState,
			items: prevState.items.map((item) =>
				item.id === e.id ? { ...item, ...e } : item,
			),
		}));
	}, []);

	const onItemSelect = useCallback((e: ItemSelectEvent) => {
		setCanvasState((prevState) => {
			console.log(e);

			const items = prevState.items.map((item) =>
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
		onChangeEnd,
		onItemSelect,
	};

	const getSelectedItem = useCallback(() => {
		return canvasState.items.find((item) => item.isSelected);
	}, [canvasState.items]);

	const addItem = useCallback((item: AddItem) => {
		setCanvasState((prevState) => ({
			...prevState,
			items: [
				...prevState.items.map((item) => ({ ...item, isSelected: false })),
				{
					...DEFAULT_ITEM_VALUE,
					id: String(prevState.items.length + 1),
					isSelected: true,
					...item,
				},
			],
		}));
	}, []);

	const updateItem = useCallback((item: UpdateItem) => {
		setCanvasState((prevState) => ({
			...prevState,
			items: prevState.items.map((i) =>
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
