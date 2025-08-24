// Import types.
import type { Box } from "../../../types/core/Box";
import type { Diagram } from "../../../types/state/catalog/Diagram";

// Import utils.
import { calcItemableOrientedBox } from "../../core/calcItemableOrientedBox";
import { isItemableState } from "../../../utils/validation/isItemableState";
import { isTransformativeState } from "../../../utils/validation/isTransformativeState";
import { calcDiagramBoundingBox } from "./calcDiagramBoundingBox";

/**
 * Calculate the bounding box of all provided diagrams.
 *
 * @param diagrams - The list of diagrams to calculate the bounding box for.
 * @returns The bounding box that encompasses all provided diagrams.
 */
export const calcDiagramsBoundingBox = (diagrams: Diagram[]): Box => {
	const box = {
		top: Number.MAX_VALUE,
		left: Number.MAX_VALUE,
		right: Number.MIN_VALUE,
		bottom: Number.MIN_VALUE,
	};

	for (const diagram of diagrams) {
		if (isItemableState(diagram)) {
			const groupOrientedBox = calcItemableOrientedBox(diagram);
			box.top = Math.min(box.top, groupOrientedBox.y);
			box.left = Math.min(box.left, groupOrientedBox.x);
			box.right = Math.max(
				box.right,
				groupOrientedBox.x + groupOrientedBox.width,
			);
			box.bottom = Math.max(
				box.bottom,
				groupOrientedBox.y + groupOrientedBox.height,
			);
		} else if (isTransformativeState(diagram)) {
			const diagramBox = calcDiagramBoundingBox(diagram);
			box.top = Math.min(box.top, diagramBox.top);
			box.left = Math.min(box.left, diagramBox.left);
			box.right = Math.max(box.right, diagramBox.right);
			box.bottom = Math.max(box.bottom, diagramBox.bottom);
		}
	}

	return box;
};
