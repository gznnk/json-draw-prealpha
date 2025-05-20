import type { Diagram } from "../../catalog/DiagramTypes";
import { isItemableData } from "../../utils/validation/isItemableData";

/**
 * Ungroup selected groups.
 *
 * @param items - List of diagrams.
 * @returns Updated list of diagrams.
 */
export const ungroupSelectedGroupsRecursive = (items: Diagram[]) => {
	// Extract the diagrams from the selected groups.
	let extractedItems: Diagram[] = [];
	for (const item of [...items]) {
		if (
			item.type === "Group" &&
			isItemableData(item) &&
			item.items !== undefined
		) {
			if (item.isSelected) {
				for (const groupItem of item.items) {
					extractedItems.push(groupItem);
				}
			} else {
				item.items = ungroupSelectedGroupsRecursive(item.items);
				extractedItems.push(item);
			}
		} else {
			extractedItems.push(item);
		}
	}

	// Remove empty groups.
	extractedItems = extractedItems.filter((item) => {
		if (isItemableData(item) && item.type === "Group") {
			if (item.items?.length === 0) {
				return false;
			}
		}
		return true;
	});

	return extractedItems;
};
