import type { Diagram } from "../../types/data/catalog/Diagram";
import type { Bounds } from "../../types/base/Bounds";
import { CANVAS_GRID_SIZE } from "../SvgCanvasConstants";
import { calcItemsBoundingBox } from "../../utils/math/geometry/calcItemsBoundingBox";

/**
 * Calculate the optimal canvas size based on the items.
 *
 * @param items - The list of items to calculate the canvas size for.
 * @returns - The optimal canvas bounds including position and dimensions.
 */
export const calcCanvasBounds = (items: Diagram[]): Bounds => {
	const bounds = calcItemsBoundingBox(items);

	let minX = 0;
	if (bounds.left < 0) {
		const minXMultiplier =
			Math.floor(Math.abs(bounds.left) / CANVAS_GRID_SIZE) + 1;
		minX = -minXMultiplier * CANVAS_GRID_SIZE;
	}

	let minY = 0;
	if (bounds.top < 0) {
		const minYMultiplier =
			Math.floor(Math.abs(bounds.top) / CANVAS_GRID_SIZE) + 1;
		minY = -minYMultiplier * CANVAS_GRID_SIZE;
	}

	// Calculate width based on the bounds of all items
	const widthMultiplier =
		Math.floor((bounds.right - bounds.left) / CANVAS_GRID_SIZE) + 1;
	const width = widthMultiplier * CANVAS_GRID_SIZE;

	// Calculate height based on the bounds of all items
	const heightMultiplier =
		Math.floor((bounds.bottom - bounds.top) / CANVAS_GRID_SIZE) + 1;
	const height = heightMultiplier * CANVAS_GRID_SIZE;

	return {
		x: minX,
		y: minY,
		width,
		height,
	};
};
