// Import types.
import type { RectangleVertices } from "../../../types/core/RectangleVertices";
import type { ConnectPointState } from "../../../types/state/shapes/ConnectPointState";

// Import utils.
import { calcRectangleVertices } from "../../math/geometry/calcRectangleVertices";
import { newId } from "../../shapes/common/newId";

/**
 * Create connection points for a button.
 *
 * @param shape - Shape parameters for the button.
 * @returns An array of connection point data.
 */
export const createButtonConnectPoint = ({
	x,
	y,
	width,
	height,
	rotation,
	scaleX,
	scaleY,
}: {
	x: number;
	y: number;
	width: number;
	height: number;
	rotation: number;
	scaleX: number;
	scaleY: number;
}): ConnectPointState[] => {
	const vertices = calcRectangleVertices({
		x,
		y,
		width,
		height,
		rotation,
		scaleX,
		scaleY,
	});

	const connectPoints: ConnectPointState[] = [];
	for (const key of Object.keys(vertices)) {
		const point = vertices[key as keyof RectangleVertices];
		connectPoints.push({
			id: newId(),
			type: "ConnectPoint",
			x: point.x,
			y: point.y,
			name: key,
		});
	}

	return connectPoints;
};