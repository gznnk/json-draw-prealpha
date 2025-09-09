// Import types.
import type { Diagram } from "../../types/state/core/Diagram";

// Import utils.
import { isItemableState } from "../validation/isItemableState";
import { calcDiagramBoundingBoxInUnrotatedGroup } from "./calcDiagramBoundingBoxInUnrotatedGroup";

/**
 * Calculates the bounding box of a group when its rotation is reset
 *
 * @param items - List of shapes in the group
 * @param groupCenterX - Group center X coordinate
 * @param groupCenterY - Group center Y coordinate
 * @param groupRotation - Group rotation angle
 * @param changeItem - Changed shape within the group
 * @returns Group bounding box
 */
export const calcUnrotatedItemableBoundingBox = (
	items: Diagram[],
	groupCenterX = 0,
	groupCenterY = 0,
	groupRotation = 0,
	changeItem?: Diagram,
) => {
	if (items.length === 0) {
		throw new Error("Unsupported itemable state");
	}

	// Recursively process shapes in the group and calculate the coordinates of the group's four sides
	let top = Number.POSITIVE_INFINITY;
	let left = Number.POSITIVE_INFINITY;
	let bottom = Number.NEGATIVE_INFINITY;
	let right = Number.NEGATIVE_INFINITY;
	for (const item of items) {
		// Exclude ConnectPoint from shape calculations
		const itemItems = isItemableState(item)
			? (item.items ?? []).filter((i) => i.type !== "ConnectPoint")
			: [];
		if (
			0 < itemItems.length &&
			isItemableState(item) &&
			item.itemableType === "abstract"
		) {
			const groupBoundingBox = calcUnrotatedItemableBoundingBox(
				itemItems,
				groupCenterX,
				groupCenterY,
				groupRotation,
				changeItem,
			);
			top = Math.min(top, groupBoundingBox.top);
			bottom = Math.max(bottom, groupBoundingBox.bottom);
			left = Math.min(left, groupBoundingBox.left);
			right = Math.max(right, groupBoundingBox.right);
		} else {
			const boundingBox = calcDiagramBoundingBoxInUnrotatedGroup(
				item.id === changeItem?.id ? changeItem : item,
				groupCenterX,
				groupCenterY,
				groupRotation,
			);
			top = Math.min(top, boundingBox.top);
			bottom = Math.max(bottom, boundingBox.bottom);
			left = Math.min(left, boundingBox.left);
			right = Math.max(right, boundingBox.right);
		}
	}

	return {
		top,
		bottom,
		left,
		right,
	};
};
