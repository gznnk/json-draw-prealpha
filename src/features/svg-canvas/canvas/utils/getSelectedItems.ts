import type { Diagram } from "../../catalog/DiagramTypes";
import { isItemableData } from "../../utils/validation/isItemableData";
import { isSelectableData } from "../../utils/validation/isSelectableData";

/**
 * Get the selected items from a list of items.
 *
 * @param items - The list of items to search.
 * @param selectedItems - The list populated with found selected items.
 * @returns {Diagram[]} - The list of selected items.
 */
export const getSelectedItems = (
	items: Diagram[],
	selectedItems: Diagram[] = [],
) => {
	for (const item of items) {
		if (isSelectableData(item)) {
			if (item.isSelected) {
				selectedItems.push(item);
			} else if (isItemableData(item)) {
				getSelectedItems(item.items, selectedItems);
			}
		}
	}
	return selectedItems;
};
