// Import types.
import type { Diagram } from "../../../types/data/catalog/Diagram";

// Import utils.
import { isItemableData } from "../../validation/isItemableData";
import { calcItemBoundingBoxInUnrotatedGroup } from "./calcItemBoundingBoxInUnrotatedGroup";

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
export const calcUnrotatedGroupBoundingBox = (
	items: Diagram[],
	groupCenterX = 0,
	groupCenterY = 0,
	groupRotation = 0,
	changeItem?: Diagram,
) => {
	// Recursively process shapes in the group and calculate the coordinates of the group's four sides
	let top = Number.POSITIVE_INFINITY;
	let left = Number.POSITIVE_INFINITY;
	let bottom = Number.NEGATIVE_INFINITY;
	let right = Number.NEGATIVE_INFINITY;
	for (const item of items) {
		// Exclude ConnectPoint from shape calculations
		const itemItems = isItemableData<Diagram>(item)
			? (item.items ?? []).filter((i) => i.type !== "ConnectPoint")
			: [];
		if (itemItems.length > 0) {
			const groupBoundingBox = calcUnrotatedGroupBoundingBox(
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
			const boundingBox = calcItemBoundingBoxInUnrotatedGroup(
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
