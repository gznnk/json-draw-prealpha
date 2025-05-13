// Import types.
import type { ConnectPointData, RectangleVertices } from "../../../types";

// Import utils.
import { calcRectangleVertices, newId } from "../../../utils";

/**
 * Create connection points for a rectangle.
 *
 * @param shape - Shape parameters for the rectangle.
 * @returns An array of connection point data.
 */
export const createRectangleConnectPoint = ({
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
}): ConnectPointData[] => {
	const vertices = calcRectangleVertices({
		x,
		y,
		width,
		height,
		rotation,
		scaleX,
		scaleY,
	});

	const connectPoints: ConnectPointData[] = [];
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
