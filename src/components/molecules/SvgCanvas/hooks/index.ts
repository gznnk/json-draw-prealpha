import { useState } from "react";
import type { ChangeEvent } from "../types";

export const useSvgCanvas = () => {
	const [canvasState, setCanvasState] = useState({
		items: [
			{ id: "1", point: { x: 10, y: 10 }, width: 100, height: 100 },
			{ id: "2", point: { x: 110, y: 110 }, width: 100, height: 100 },
		],
	});

	const canvasProps = {
		...canvasState,
		onChangeEnd: (e: ChangeEvent) => {
			setCanvasState((prevState) => ({
				items: prevState.items.map((item) =>
					item.id === e.id ? { ...item, ...e } : item,
				),
			}));
		},
	};

	const canvasFunctions = {
		addRectangle: () => {
			setCanvasState((prevState) => ({
				items: [
					...prevState.items,
					{
						id: String(prevState.items.length + 1),
						point: { x: 10, y: 10 },
						width: 100,
						height: 100,
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
