import type { Diagram } from "../../types/state/core/Diagram";
import { isItemableState } from "../../utils/validation/isItemableState";

/**
 * Find all diagrams with the given IDs recursively
 * @param items - Array of diagrams to search
 * @param ids - Array of IDs to find
 * @returns Array of found diagrams
 */
export const findDiagramsById = (
	items: Diagram[],
	ids: string[],
): Diagram[] => {
	const found: Diagram[] = [];
	const idSet = new Set(ids);

	const searchRecursively = (diagrams: Diagram[]) => {
		for (const diagram of diagrams) {
			if (idSet.has(diagram.id)) {
				found.push(diagram);
			}
			if (isItemableState(diagram) && diagram.items) {
				searchRecursively(diagram.items);
			}
		}
	};

	searchRecursively(items);
	return found;
};
