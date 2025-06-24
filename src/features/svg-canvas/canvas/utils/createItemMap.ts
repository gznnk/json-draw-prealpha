// Import types related to SvgCanvas.
import type { Diagram } from "../../types/data/catalog/Diagram";

// Import validation functions.
import { isItemableData } from "../../utils/validation/isItemableData";

/**
 * Recursively creates a map of item IDs to their Diagram objects.
 *
 * This function traverses all diagram items (including nested ones) and
 * builds a Map for fast ID-based lookup. Useful for high-performance scenarios.
 *
 * @param items - Array of diagram items to collect
 * @returns Map where keys are item IDs and values are Diagram objects
 */
export const createItemMap = (items: Diagram[]): Map<string, Diagram> => {
	const itemMap = new Map<string, Diagram>();

	const storeItems = (itemsToProcess: Diagram[]) => {
		for (const item of itemsToProcess) {
			itemMap.set(item.id, item);
			if (isItemableData(item)) {
				storeItems(item.items);
			}
		}
	};

	storeItems(items);
	return itemMap;
};
