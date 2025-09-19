import type { Diagram } from "../../types/state/core/Diagram";
import { isItemableState } from "../../utils/validation/isItemableState";
import type { SvgCanvasState } from "../types/SvgCanvasState";

/**
 * Retrieves all ancestor items (groups) that contain the specified item.
 * Returns an array of ancestor items ordered from outermost to innermost.
 *
 * @param id - The ID of the diagram item to find ancestors for
 * @param canvasState - The current canvas state containing all items
 * @returns Array of ancestor items that contain the specified item, ordered from root to leaf
 */
export const getAncestorItemsById = (
	id: string,
	canvasState: SvgCanvasState,
): Diagram[] => {
	return getAncestorItemsByIdInternal(id, canvasState.items);
};

/**
 * Internal recursive function to find ancestor items containing the specified item.
 * Searches through the provided items array and recursively searches within groups.
 *
 * @param id - The ID of the diagram item to find ancestors for
 * @param items - Array of diagram items to search through
 * @returns Array of ancestor items that contain the specified item
 */
const getAncestorItemsByIdInternal = (
	id: string,
	items: Diagram[],
): Diagram[] => {
	if (items.some((canvasItem) => canvasItem.id === id)) {
		return [];
	}
	const ancestors: Diagram[] = [];
	for (const canvasItem of items) {
		if (canvasItem.type === "Group" && isItemableState(canvasItem)) {
			// Check if the item is directly contained in this group
			if (canvasItem.items.some((groupItem) => groupItem.id === id)) {
				ancestors.push(canvasItem);
			} else {
				// Recursively search in nested groups
				const foundAncestors = getAncestorItemsByIdInternal(
					id,
					canvasItem.items,
				);
				if (foundAncestors.length > 0) {
					ancestors.push(canvasItem, ...foundAncestors);
				}
			}
		}
	}
	return ancestors;
};
