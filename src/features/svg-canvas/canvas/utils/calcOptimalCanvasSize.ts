import type { Diagram } from "../../catalog/DiagramTypes";
import { CANVAS_EXPANSION_SIZE } from "../SvgCanvasConstants";
import { calcBoundsOfAllItems } from "./calcBoundsOfAllItems";

/**
 * Calculate the optimal canvas size based on the items.
 *
 * @param items - The list of items to calculate the canvas size for.
 * @returns - The optimal canvas size.
 */
export const calcOptimalCanvasSize = (items: Diagram[]) => {
	const bounds = calcBoundsOfAllItems(items);

	let minX = 0;
	if (bounds.left < 0) {
		const minXMultiplier =
			Math.floor(Math.abs(bounds.left) / CANVAS_EXPANSION_SIZE) + 1;
		minX = -minXMultiplier * CANVAS_EXPANSION_SIZE;
	}

	let minY = 0;
	if (bounds.top < 0) {
		const minYMultiplier =
			Math.floor(Math.abs(bounds.top) / CANVAS_EXPANSION_SIZE) + 1;
		minY = -minYMultiplier * CANVAS_EXPANSION_SIZE;
	}

	const widthMultiplier =
		Math.floor((bounds.right - bounds.left) / CANVAS_EXPANSION_SIZE) + 1;
	let width = widthMultiplier * CANVAS_EXPANSION_SIZE;

	const heightMultiplier =
		Math.floor((bounds.bottom - bounds.top) / CANVAS_EXPANSION_SIZE) + 1;
	let height = heightMultiplier * CANVAS_EXPANSION_SIZE;

	if (width < window.screen.width) {
		width =
			(Math.floor(window.screen.width / CANVAS_EXPANSION_SIZE) + 1) *
			CANVAS_EXPANSION_SIZE;
	}
	if (height < window.screen.height) {
		height =
			(Math.floor(window.screen.height / CANVAS_EXPANSION_SIZE) + 1) *
			CANVAS_EXPANSION_SIZE;
	}

	return {
		minX,
		minY,
		width,
		height,
	};
};
