// Import types.
import type { Diagram } from "../../../types/data/catalog/Diagram";
import type { RectangleVertices } from "../../../types/base/RectangleVertices";
import type { Shape } from "../../../types/base/Shape";
import type { ConnectPointMoveData } from "../../../types/events/ConnectPointMoveData";

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

	// Calculate the vertices of the rectangle.
	const vertices = calcRectangleVertices(diagram as Shape);

	// Create connection point move data.
	const newConnectPoints: ConnectPointMoveData[] = [];
	for (const connectPointData of diagram.connectPoints) {
		const vertex = (vertices as RectangleVertices)[
			connectPointData.name as keyof RectangleVertices
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
