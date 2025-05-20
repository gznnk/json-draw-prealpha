import type { Diagram } from "../../catalog/DiagramTypes";
import { calcBoundsOfGroup } from "../../components/shapes/Group";
import { isItemableData } from "../../utils/validation/isItemableData";
import { applyRecursive } from "./applyRecursive";

/**
 * Update the outline of all groups in the diagram.
 *
 * @param items - The list of diagrams to update.
 * @returns {Diagram[]} - The updated list of diagrams with the outline of all groups updated.
 */
export const updateOutlineOfAllGroups = (items: Diagram[]): Diagram[] => {
	return applyRecursive(items, (item) => {
		if (isItemableData(item)) {
			// Calculate the bounds of the group.
			const box = calcBoundsOfGroup(item);
			if (
				item.x === box.x &&
				item.y === box.y &&
				item.width === box.width &&
				item.height === box.height
			) {
				// If the bounds are the same, return the original object.
				// This is important for React to detect no changes in the reference.
				return item;
			}

			// Return the new object with updated bounds.
			return {
				...item,
				x: box.x,
				y: box.y,
				width: box.width,
				height: box.height,
			};
		}
		return item;
	});
};
