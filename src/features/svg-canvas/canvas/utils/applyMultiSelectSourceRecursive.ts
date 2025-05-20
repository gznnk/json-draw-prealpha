import type { Diagram } from "../../catalog/DiagramTypes";
import { isItemableData } from "../../utils/validation/isItemableData";
import { isSelectableData } from "../../utils/validation/isSelectableData";

/**
 * Recursively apply the `isMultiSelectSource` property to the selected items.
 *
 * This function sets the `isMultiSelectSource` property to `true` for all selected items and their descendants.
 * If a group is selected, it applies the property to all items within that group.
 * Any item for which this function sets `isMultiSelectSource = true` will be hidden in the UI.
 *
 * @param items - The list of items to process.
 * @param isGroupMultiSelected - Indicates if the item is a group that is multi-selected.
 * @returns {Diagram[]} - The updated list of items with the `isMultiSelectSource` property applied.
 */
export const applyMultiSelectSourceRecursive = (
	items: Diagram[],
	isGroupMultiSelected = false,
): Diagram[] => {
	return items.map((item) => {
		const newItem = { ...item };
		if (!isSelectableData(newItem)) {
			return item;
		}
		newItem.isMultiSelectSource = isGroupMultiSelected || newItem.isSelected;
		if (isItemableData(newItem)) {
			newItem.items = applyMultiSelectSourceRecursive(
				newItem.items ?? [],
				newItem.isMultiSelectSource,
			);
		}
		return newItem;
	});
};
