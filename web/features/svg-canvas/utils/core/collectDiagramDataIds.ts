import type { DiagramData } from "../../types/data/core/DiagramData";
import { isItemableData } from "../validation/isItemableData";

/**
 * Recursively collects all diagram IDs from an array of diagram data, including nested items.
 *
 * @param diagrams - Array of diagram data to process
 * @returns Array of all diagram IDs found recursively
 */
export const collectDiagramDataIds = (diagrams: DiagramData[]): string[] => {
	const result: string[] = [];

	for (const diagram of diagrams) {
		// Add current diagram's ID
		result.push(diagram.id);

		// If diagram has items, recursively collect their IDs
		if (isItemableData(diagram) && diagram.items.length > 0) {
			const childIds = collectDiagramDataIds(diagram.items);
			result.push(...childIds);
		}
	}

	return result;
};