import type { Diagram } from "../../catalog/DiagramTypes";
import type { Bounds } from "../../types/base/Bounds";
import { CANVAS_EXPANSION_SIZE } from "../SvgCanvasConstants";
import { calcBoundsOfAllItems } from "./calcBoundsOfAllItems";

/**
 * Calculate the optimal canvas size based on the items.
 *
 * @param items - The list of items to calculate the canvas size for.
 * @returns - The optimal canvas bounds including position and dimensions.
 */
export const calcOptimalCanvasSize = (items: Diagram[]): Bounds => {
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

	// Calculate width based on the bounds of all items
	const widthMultiplier =
		Math.floor((bounds.right - bounds.left) / CANVAS_EXPANSION_SIZE) + 1;
	const width = widthMultiplier * CANVAS_EXPANSION_SIZE;

	// Calculate height based on the bounds of all items
	const heightMultiplier =
		Math.floor((bounds.bottom - bounds.top) / CANVAS_EXPANSION_SIZE) + 1;
	const height = heightMultiplier * CANVAS_EXPANSION_SIZE;

	return {
		x: minX,
		y: minY,
		width,
		height,
	};
};
