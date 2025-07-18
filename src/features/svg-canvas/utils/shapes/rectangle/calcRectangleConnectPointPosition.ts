// Import types.
import type { RectangleVertices } from "../../../types/core/RectangleVertices";
import type { Shape } from "../../../types/core/Shape";
import type { Diagram } from "../../../types/data/catalog/Diagram";
import type { ConnectPointData } from "../../../types/data/shapes/ConnectPointData";

// Import utils.
import { calcRectangleVertices } from "../../../utils/math/geometry/calcRectangleVertices";
import { isConnectableData } from "../../../utils/validation/isConnectableData";

/**
 * Calculate the position of the connection points of the rectangle.
 *
 * @param diagram - The diagram data of the rectangle.
 * @returns An array of connection point move data.
 */
export const calcRectangleConnectPointPosition = (
	diagram: Diagram,
): ConnectPointData[] => {
	if (!isConnectableData(diagram)) return []; // Type guard.

	// Calculate the vertices of the rectangle.
	const vertices = calcRectangleVertices(diagram as Shape);

	// Create connection point move data.
	const newConnectPoints: ConnectPointData[] = [];
	for (const connectPointData of diagram.connectPoints) {
		const vertex = (vertices as RectangleVertices)[
			connectPointData.name as keyof RectangleVertices
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
