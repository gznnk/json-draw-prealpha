// Import types related to SvgCanvas.
import type { Diagram } from "../../../../types/data/catalog/Diagram";

// Import utils.
import { isItemableData } from "../../../../utils/validation/isItemableData";
import { isTextableData } from "../../../../utils/validation/isTextableData";

/**
 * Recursively searches through diagram items to find the item currently in text editing mode.
 * Examines both direct items and nested items within containers.
 *
 * @param items - Array of diagram items to search through
 * @returns The diagram item in text editing mode or undefined if none found
 */
export const getTextEditingItem = (items: Diagram[]): Diagram | undefined => {
	for (const item of items) {
		if (isTextableData(item) && item.isTextEditing) {
			return item;
		}
		if (isItemableData(item)) {
			const childItem = getTextEditingItem(item.items);
			if (childItem) {
				return childItem;
			}
		}
	}
};
