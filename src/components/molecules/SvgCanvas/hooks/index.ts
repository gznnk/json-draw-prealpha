import { useState, useCallback } from "react";
import type { ItemSelectEvent, ChangeEvent } from "../types";

export const useSvgCanvas = () => {
	const [canvasState, setCanvasState] = useState({
		items: [
			{
				id: "1",
				type: "rect",
				point: { x: 10, y: 10 },
				width: 100,
				height: 100,
			},
			{
				id: "2",
				type: "ellipse",
				point: { x: 110, y: 110 },
				width: 100,
				height: 100,
			},
		],
		selectedItemId: "",
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
			const items = prevState.items.map((item) =>
				item.id === e.id
					? { ...item, isSelected: true }
					: { ...item, isSelected: false },
			);

			// console.log(items);

			return {
				...prevState,
				items,
				selectedItemId: e.id || "",
			};
		});
	}, []);

	const canvasProps = {
		...canvasState,
		onChangeEnd,
		onItemSelect,
	};

	const canvasFunctions = {
		addRectangle: () => {
			setCanvasState((prevState) => ({
				...prevState,
				items: [
					...prevState.items.map((item) => ({ ...item, isSelected: false })),
					{
						id: String(prevState.items.length + 1),
						type: "rect",
						point: { x: 10, y: 10 },
						width: 100,
						height: 100,
						isSelected: true,
					},
				],
			}));
		},
	};

	return {
		state: [canvasState, setCanvasState],
		canvasProps,
		canvasFunctions,
	} as const;
};
