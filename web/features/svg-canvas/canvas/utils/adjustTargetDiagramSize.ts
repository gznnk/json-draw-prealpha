import type { Diagram } from "../../types/state/core/Diagram";
import { getDiagramById } from "../../utils/core/getDiagramById";
import { calcDiagramBoundingBox } from "../../utils/math/geometry/calcDiagramBoundingBox";
import { calcDiagramsBoundingBox } from "../../utils/math/geometry/calcDiagramsBoundingBox";
import { isFrame } from "../../utils/validation/isFrame";
import { isItemableState } from "../../utils/validation/isItemableState";

/**
 * Options for adjusting target diagram size
 */
export type AdjustTargetDiagramSizeOptions = {
	/** Padding to add around children when resizing (default: 0) */
	padding?: number;
};

/**
 * Adjusts target diagram size if its children extend beyond bounds.
 * Returns the updated diagrams array with the target diagram resized if necessary.
 *
 * @param diagrams - Array of diagrams to process
 * @param targetId - ID of the target diagram to potentially resize
 * @param originalTargetDiagram - Original target diagram before append operation
 * @param options - Configuration options for the adjustment
 * @returns Updated diagrams array with resized target diagram if needed
 */
export const adjustTargetDiagramSize = (
	diagrams: Diagram[],
	targetId: string,
	originalTargetDiagram: Diagram,
	options: AdjustTargetDiagramSizeOptions = {},
): Diagram[] => {
	const { padding = 0 } = options;

	// Only process Frame type diagrams
	if (!isFrame(originalTargetDiagram)) {
		return diagrams;
	}

	// Get the updated target diagram
	const updatedTargetDiagram = getDiagramById(diagrams, targetId);
	if (
		!updatedTargetDiagram ||
		!isFrame(updatedTargetDiagram) ||
		!isItemableState(updatedTargetDiagram) ||
		!updatedTargetDiagram.items
	) {
		return diagrams;
	}

	// Calculate current target diagram bounds
	const targetBounds = calcDiagramBoundingBox(originalTargetDiagram);

	// Calculate bounds of all items inside target diagram
	const childrenBounds = calcDiagramsBoundingBox(updatedTargetDiagram.items);

	if (!childrenBounds) {
		return diagrams;
	}

	// Check if children extend beyond target bounds
	const needsResize =
		childrenBounds.left < targetBounds.left ||
		childrenBounds.right > targetBounds.right ||
		childrenBounds.top < targetBounds.top ||
		childrenBounds.bottom > targetBounds.bottom;

	if (!needsResize) {
		return diagrams;
	}

	// Calculate new bounds that contain all children with padding
	const newLeft = Math.min(targetBounds.left, childrenBounds.left - padding);
	const newTop = Math.min(targetBounds.top, childrenBounds.top - padding);
	const newRight = Math.max(targetBounds.right, childrenBounds.right + padding);
	const newBottom = Math.max(
		targetBounds.bottom,
		childrenBounds.bottom + padding,
	);

	// Calculate new center, width, and height
	const newCenterX = (newLeft + newRight) / 2;
	const newCenterY = (newTop + newBottom) / 2;
	const newWidth = newRight - newLeft;
	const newHeight = newBottom - newTop;

	// Update target diagram with new dimensions
	return diagrams.map((item) => {
		if (item.id === targetId) {
			return {
				...item,
				x: newCenterX,
				y: newCenterY,
				width: newWidth,
				height: newHeight,
			};
		}
		return item;
	});
};
