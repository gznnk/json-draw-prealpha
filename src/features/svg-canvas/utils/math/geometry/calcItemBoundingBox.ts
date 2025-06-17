// Import types.
import type { Box } from "../../../types/base/Box";
import type { Diagram } from "../../../types/data/catalog/Diagram";

// Import utils.
import { isShape } from "../../validation/isShape";
import { degreesToRadians } from "../common/degreesToRadians";
import { affineTransformation } from "../transform/affineTransformation";

/**
 * Calculates the bounding box of a diagram item.
 * Returns the box coordinates representing the item's outer bounds.
 * Note: x and y represent the center coordinates of the item.
 *
 * @param item - The diagram item to calculate bounding box for
 * @returns The bounding box with top, left, right, bottom coordinates
 */
export const calcItemBoundingBox = (item: Diagram): Box => {
	const { x, y } = item;

	// For non-shape items (points, etc.), return a point box
	if (!isShape(item)) {
		return {
			top: y,
			left: x,
			right: x,
			bottom: y,
		};
	}

	const { width, height, rotation, scaleX, scaleY } = item;

	const halfWidth = width / 2;
	const halfHeight = height / 2;

	// For items with rotation, calculate all four corners and find bounding box
	if (rotation !== 0) {
		const radians = degreesToRadians(rotation);

		// Calculate all four corners
		const topLeft = affineTransformation(
			-halfWidth,
			-halfHeight,
			scaleX,
			scaleY,
			radians,
			x,
			y,
		);

		const bottomLeft = affineTransformation(
			-halfWidth,
			halfHeight,
			scaleX,
			scaleY,
			radians,
			x,
			y,
		);

		const topRight = affineTransformation(
			halfWidth,
			-halfHeight,
			scaleX,
			scaleY,
			radians,
			x,
			y,
		);

		const bottomRight = affineTransformation(
			halfWidth,
			halfHeight,
			scaleX,
			scaleY,
			radians,
			x,
			y,
		);

		// Find min/max coordinates
		const left = Math.min(topLeft.x, topRight.x, bottomLeft.x, bottomRight.x);
		const right = Math.max(topLeft.x, topRight.x, bottomLeft.x, bottomRight.x);
		const top = Math.min(topLeft.y, topRight.y, bottomLeft.y, bottomRight.y);
		const bottom = Math.max(topLeft.y, topRight.y, bottomLeft.y, bottomRight.y);

		return { top, left, right, bottom };
	}

	// For non-rotated transformative items, calculate simple bounding box
	return {
		top: y - halfHeight,
		left: x - halfWidth,
		right: x + halfWidth,
		bottom: y + halfHeight,
	};
};
