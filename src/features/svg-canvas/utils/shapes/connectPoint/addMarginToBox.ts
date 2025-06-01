import type { Box } from "../../../types/base/Box";
import { CONNECT_LINE_MARGIN } from "../../../components/shapes/ConnectPoint/ConnectPoint/ConnectPointConstants";

/**
 * Adds margin to a box and returns a new box with expanded boundaries.
 *
 * @param box - The box to add margin to
 * @returns A new box with added margin
 */
export const addMarginToBox = (box: Box): Box => {
	const left = box.left - CONNECT_LINE_MARGIN;
	const top = box.top - CONNECT_LINE_MARGIN;
	const right = box.right + CONNECT_LINE_MARGIN;
	const bottom = box.bottom + CONNECT_LINE_MARGIN;
	return {
		top,
		left,
		right,
		bottom,
		center: box.center,
		leftTop: { x: left, y: top },
		leftBottom: { x: left, y: bottom },
		rightTop: { x: right, y: top },
		rightBottom: { x: right, y: bottom },
	};
};
