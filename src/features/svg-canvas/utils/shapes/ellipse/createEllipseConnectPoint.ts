// Import types related to SvgCanvas.
import type { EllipseVertices } from "../../../types/base";
import type { ConnectPointData } from "../../../types/data";

// Import functions related to SvgCanvas.
import { newId, calcEllipseVertices } from "../../../utils";

/**
 * Create connection points for the ellipse.
 *
 * @param params - The parameters for creating the connection points.
 * @returns An array of connection point data.
 */
export const createEllipseConnectPoint = ({
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
	const vertices = calcEllipseVertices({
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
		const point = vertices[key as keyof EllipseVertices];
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
