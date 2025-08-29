// Import types.
import type { Diagram } from "../../../types/state/catalog/Diagram";
import type { ConnectPointState } from "../../../types/state/shapes/ConnectPointState";
import type { RectangleVertices } from "../../../types/core/RectangleVertices";
import type { Frame } from "../../../types/core/Frame";

// Import utils.
import { isConnectableState } from "../../validation/isConnectableState";
import { calcRectangleVertices } from "../../math/geometry/calcRectangleVertices";

/**
 * Calculate connect point positions for Button
 */
export const calcButtonConnectPointPosition = (
	diagram: Diagram,
): ConnectPointState[] => {
	if (!isConnectableState(diagram)) return []; // Type guard.

	// Calculate the vertices of the button (using rectangle vertices).
	const vertices = calcRectangleVertices(diagram as Frame);

	// Create connection point move data.
	const newConnectPoints: ConnectPointState[] = [];
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