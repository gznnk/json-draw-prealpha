// Import types.
import type { Diagram } from "../../../catalog/DiagramTypes";
import type { ConnectPointMoveData } from "../../../types/events/ConnectPointMoveData";
import type { EllipseVertices } from "../../../types/base/EllipseVertices";
import type { Shape } from "../../../types/base/Shape";

// Import utils.
import { calcEllipseVertices } from "../../math/geometry/calcEllipseVertices";
import { isConnectableData } from "../../validation/isConnectableData";

/**
 * Calculate the position of the connection points of the ellipse.
 *
 * @param diagram - The diagram data of the ellipse.
 * @returns An array of connection point move data.
 */
export const calcEllipseConnectPointPosition = (
	diagram: Diagram,
): ConnectPointMoveData[] => {
	if (!isConnectableData(diagram)) return []; // Type guard.

	const shape = {
		x: diagram.x,
		y: diagram.y,
		width: diagram.width,
		height: diagram.height,
		rotation: diagram.rotation,
		scaleX: diagram.scaleX,
		scaleY: diagram.scaleY,
	} as Shape;

	// Calculate the vertices of the ellipse.
	const vertices = calcEllipseVertices(diagram as Shape);

	// Create connection point move data.
	const newConnectPoints: ConnectPointMoveData[] = [];
	for (const connectPointData of diagram.connectPoints) {
		const vertex = (vertices as EllipseVertices)[
			connectPointData.name as keyof EllipseVertices
		];

		newConnectPoints.push({
			id: connectPointData.id,
			name: connectPointData.name,
			x: vertex.x,
			y: vertex.y,
			ownerId: diagram.id,
			ownerShape: shape,
		});
	}

	return newConnectPoints;
};
