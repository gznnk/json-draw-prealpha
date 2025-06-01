import type { Point } from "../../../types/base/Point";
import type { Shape } from "../../../types/base/Shape";
import { calcRectangleOuterBox } from "../../math/geometry/calcRectangleOuterBox";
import { getLineDirection } from "./getLineDirection";
import { CONNECT_LINE_MARGIN } from "../../../components/shapes/ConnectPoint/ConnectPoint/ConnectPointConstants";

/**
 * Gets the second connect point for a shape based on direction.
 *
 * @param ownerShape - The shape that owns the connect point
 * @param cx - Connect point x coordinate
 * @param cy - Connect point y coordinate
 * @returns The second connect point
 */
export const getSecondConnectPoint = (
	ownerShape: Shape,
	cx: number,
	cy: number,
): Point => {
	const ownerOuterBox = calcRectangleOuterBox(ownerShape);
	const direction = getLineDirection(ownerShape.x, ownerShape.y, cx, cy);

	if (direction === "up") {
		return { x: cx, y: ownerOuterBox.top - CONNECT_LINE_MARGIN };
	}
	if (direction === "down") {
		return { x: cx, y: ownerOuterBox.bottom + CONNECT_LINE_MARGIN };
	}
	if (direction === "left") {
		return { x: ownerOuterBox.left - CONNECT_LINE_MARGIN, y: cy };
	}
	if (direction === "right") {
		return { x: ownerOuterBox.right + CONNECT_LINE_MARGIN, y: cy };
	}
	return { x: 0, y: 0 };
};
