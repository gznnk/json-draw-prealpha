import type {
	DiagramPath,
	DiagramPathIndex,
} from "../../types/core/DiagramPath";
import type { Diagram } from "../../types/state/core/Diagram";
import type { ItemableState } from "../../types/state/core/ItemableState";
import { isItemableState } from "../../utils/validation/isItemableState";

/**
 * Gets a diagram at a specific path.
 * @param items - Root level diagrams
 * @param path - Path to the diagram
 * @returns The diagram at the path, or undefined if not found
 */
const getDiagramAtPath = (
	items: Diagram[],
	path: DiagramPath,
): Diagram | undefined => {
	let current: Diagram[] = items;
	let diagram: Diagram | undefined;

	for (let i = 0; i < path.length; i++) {
		const idx = path[i];
		if (idx >= current.length) return undefined;

		diagram = current[idx];
		if (i < path.length - 1) {
			// Not at the end yet, need to go deeper
			if (!isItemableState(diagram)) return undefined;
			current = diagram.items;
		}
	}

	return diagram;
};

/**
 * Sets a diagram at a specific path (immutably).
 * This implementation avoids recursion by building the new structure from the path.
 * @param items - Root level diagrams
 * @param path - Path to the diagram
 * @param newDiagram - New diagram to set
 * @returns Updated diagrams array
 */
const setDiagramAtPath = (
	items: Diagram[],
	path: DiagramPath,
	newDiagram: Diagram,
): Diagram[] => {
	if (path.length === 0) return items;

	// Build array of items that need to be updated along the path
	const itemsToUpdate: Diagram[] = [];
	let current: Diagram[] = items;

	// Navigate to the target, collecting items along the way
	for (let i = 0; i < path.length - 1; i++) {
		const idx = path[i];
		if (idx >= current.length) return items;

		const item = current[idx];
		itemsToUpdate.push(item);

		if (!isItemableState(item)) return items;
		current = item.items;
	}

	// Start from the deepest level and work our way up
	let result: Diagram[] = current;
	const lastIdx = path[path.length - 1];

	// Update the target diagram
	result = result.map((item, i) => (i === lastIdx ? newDiagram : item));

	// Work backwards up the path, updating each parent
	for (let i = itemsToUpdate.length - 1; i >= 0; i--) {
		const parentItem = itemsToUpdate[i];
		const pathIdx = path[i];

		if (!isItemableState(parentItem)) return items;

		const updatedParent = {
			...parentItem,
			items: result,
		} as unknown as Diagram;

		// Get the parent's siblings and update the array
		const parentLevel: Diagram[] =
			i === 0
				? items
				: isItemableState(itemsToUpdate[i - 1])
					? (itemsToUpdate[i - 1] as unknown as ItemableState).items
					: [];
		result = parentLevel.map((item, idx) =>
			idx === pathIdx ? updatedParent : item,
		);
	}

	return result;
};

/**
 * Updates diagrams at specific paths using an update function.
 * This uses direct path access to avoid traversing the entire tree.
 * @param items - Root level diagrams
 * @param pathIndex - Map of diagram IDs to their paths
 * @param updateFn - Function to update a diagram
 * @returns Updated diagrams array
 */
export const updateDiagramsByPath = (
	items: Diagram[],
	pathIndex: DiagramPathIndex,
	updateFn: (diagram: Diagram, path: DiagramPath) => Diagram,
): Diagram[] => {
	if (pathIndex.size === 0) return items;

	let result = items;

	// Process each path and update the diagram at that path
	pathIndex.forEach((path) => {
		const diagram = getDiagramAtPath(result, path);
		if (diagram) {
			const updatedDiagram = updateFn(diagram, path);
			result = setDiagramAtPath(result, path, updatedDiagram);
		}
	});

	return result;
};
