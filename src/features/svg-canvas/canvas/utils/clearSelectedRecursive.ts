import type { Diagram } from "../../types/data/catalog/Diagram";
import { isSelectableData } from "../../utils/validation/isSelectableData";
import { applyFunctionRecursively } from "./applyFunctionRecursively";

/**
 * Recursively clear the selection state of all items.
 *
 * @param items - The list of items to process.
 * @returns {Diagram[]} - The updated list of items with the selection state cleared.
 */
export const clearSelectedRecursive = (items: Diagram[]) => {
	return applyFunctionRecursively(items, (item) =>
		isSelectableData(item)
			? {
					...item,
					isSelected: false,
					isAncestorSelected: false,
					showTransformControls: false,
				}
			: item,
	);
};
