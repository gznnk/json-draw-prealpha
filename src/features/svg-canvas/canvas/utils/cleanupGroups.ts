// Import types.
import type { Diagram } from "../../types/state/core/Diagram";

// Import utils.
import { isGroupState } from "../../utils/validation/isGroupState";

/**
 * Recursively clean up groups by removing empty groups and ungrouping single-item groups.
 *
 * @param items - Array of diagram items to process
 * @returns Cleaned up array of diagram items
 */
export const cleanupGroups = (items: Diagram[]): Diagram[] => {
	const result: Diagram[] = [];

	for (const item of items) {
		if (isGroupState(item)) {
			// Recursively cleanup nested groups first
			const cleanedItems = cleanupGroups(item.items);

			if (cleanedItems.length === 0) {
				// Remove empty groups
			} else if (cleanedItems.length === 1) {
				// Ungroup single-item groups - add the single item directly
				result.push(cleanedItems[0]);
			} else {
				// Keep groups with multiple items, but with cleaned up items
				result.push({
					...item,
					items: cleanedItems,
				} as typeof item);
			}
		} else {
			result.push(item);
		}
	}

	return result;
};
