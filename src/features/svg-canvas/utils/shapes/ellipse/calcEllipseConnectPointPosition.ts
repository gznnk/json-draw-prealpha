// Import types.
import type { EllipseVertices } from "../../../types/core/EllipseVertices";
import type { Shape } from "../../../types/core/Shape";
import type { Diagram } from "../../../types/data/catalog/Diagram";
import type { ConnectPointData } from "../../../types/data/shapes/ConnectPointData";

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
): ConnectPointData[] => {
	if (!isConnectableData(diagram)) return []; // Type guard.

	// Calculate the vertices of the ellipse.
	const vertices = calcEllipseVertices(diagram as Shape);

	// Create connection point move data.
	const newConnectPoints: ConnectPointData[] = [];
	for (const connectPointData of diagram.connectPoints) {
		const vertex = (vertices as EllipseVertices)[
			connectPointData.name as keyof EllipseVertices
		];

		newConnectPoints.push({
			id: connectPointData.id,
			type: "ConnectPoint",
			name: connectPointData.name,
			x: vertex.x,
			y: vertex.y,
			isDragging: false,
		});
	}

	return newConnectPoints;
};
