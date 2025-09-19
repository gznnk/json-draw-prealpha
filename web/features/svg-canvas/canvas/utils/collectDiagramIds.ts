import type { Diagram } from "../../types/state/core/Diagram";
import { isItemableState } from "../../utils/validation/isItemableState";

/**
 * Recursively collects all diagram IDs from an array of diagrams, including nested items.
 *
 * @param diagrams - Array of diagrams to process
 * @returns Array of all diagram IDs found recursively
 */
export const collectDiagramIds = (diagrams: Diagram[]): string[] => {
	const result: string[] = [];

	for (const diagram of diagrams) {
		// Add current diagram's ID
		result.push(diagram.id);

		// If diagram has items, recursively collect their IDs
		if (isItemableState(diagram) && diagram.items.length > 0) {
			const childIds = collectDiagramIds(diagram.items);
			result.push(...childIds);
		}
	}

	return result;
};
