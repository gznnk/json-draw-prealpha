// Import types related to SvgCanvas.
import type { Diagram } from "../../../../catalog"; // TODO: 依存関係を見直す

// Import utils.
import { isItemableData, isTextableData } from "../../../../utils";

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
