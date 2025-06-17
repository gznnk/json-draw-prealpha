import type { Diagram } from "../../types/data/catalog/Diagram";
import { isItemableData } from "../../utils/validation/isItemableData";

/**
 * Ungroup selected groups.
 *
 * @param items - List of all existing diagrams.
 * @returns Updated list of diagrams.
 */
export const ungroupSelectedGroupsRecursive = (items: Diagram[]) => {
	// Recursively ungroup selected groups and rebuild the item list.
	const ungroupedItems: Diagram[] = [];

	for (const item of items) {
		if (item.type === "Group" && isItemableData(item)) {
			if (item.isSelected) {
				for (const groupItem of item.items) {
					ungroupedItems.push(groupItem);
				}
			} else {
				const updatedGroup: Diagram = {
					...item,
					items: ungroupSelectedGroupsRecursive(item.items),
				};
				ungroupedItems.push(updatedGroup);
			}
		} else {
			ungroupedItems.push(item);
		}
	}

	// Remove empty groups.
	const cleanedItems = ungroupedItems.filter((item) => {
		if (
			item.type === "Group" &&
			isItemableData(item) &&
			item.items.length === 0
		) {
			return false;
		}
		return true;
	});

	return cleanedItems;
};
