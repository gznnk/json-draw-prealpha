import type { Diagram } from "../../types/state/core/Diagram";
import { isItemableState } from "../../utils/validation/isItemableState";

/**
 * Path to a diagram in the tree structure.
 * Example: [0, 2, 1] means items[0].items[2].items[1]
 */
export type DiagramPath = number[];

/**
 * Index mapping diagram IDs to their paths in the tree.
 */
export type DiagramPathIndex = Map<string, DiagramPath>;

/**
 * Creates an index mapping diagram IDs to their paths in the tree.
 * Only creates paths for diagrams whose IDs are in the targetIds set.
 * @param items - Root level diagrams
 * @param targetIds - Set of diagram IDs to create paths for
 * @returns Map of diagram ID to path
 */
export const createDiagramPathIndex = (
	items: Diagram[],
	targetIds: Set<string>,
): DiagramPathIndex => {
	const index: DiagramPathIndex = new Map();

	const traverse = (diagrams: Diagram[], currentPath: DiagramPath) => {
		diagrams.forEach((diagram, idx) => {
			const path = [...currentPath, idx];

			// If this diagram is in the target set, add to index
			if (targetIds.has(diagram.id)) {
				index.set(diagram.id, path);
			}

			// Continue traversing children
			if (isItemableState(diagram)) {
				traverse(diagram.items, path);
			}
		});
	};

	traverse(items, []);

	return index;
};
