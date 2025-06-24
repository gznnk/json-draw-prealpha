// Import types related to SvgCanvas.
import type { Diagram } from "../../types/data/catalog/Diagram";

// Import validation functions.
import { isItemableData } from "../../utils/validation/isItemableData";

/**
 * Recursively creates a map of item IDs to their position {x, y}.
 *
 * This function traverses all diagram items (including nested ones) and
 * builds a Map for fast ID-based lookup. Useful for high-performance scenarios.
 *
 * @param items - Array of diagram items to collect positions from
 * @returns Map where keys are item IDs and values are { x, y } coordinates
 */
export const createItemPositionMap = (
	items: Diagram[],
): Map<string, { x: number; y: number }> => {
	const positionMap = new Map<string, { x: number; y: number }>();
	storeItemPositions(items, positionMap);
	return positionMap;
};

const storeItemPositions = (
	items: Diagram[],
	positionMap: Map<string, { x: number; y: number }>,
): void => {
	for (const item of items) {
		positionMap.set(item.id, { x: item.x, y: item.y });
		if (isItemableData(item)) {
			storeItemPositions(item.items, positionMap);
		}
	}
};
