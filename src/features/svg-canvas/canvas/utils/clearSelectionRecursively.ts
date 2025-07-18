import type { Diagram } from "../../types/data/catalog/Diagram";
import { isSelectableData } from "../../utils/validation/isSelectableData";
import { isTransformativeData } from "../../utils/validation/isTransformativeData";
import { applyFunctionRecursively } from "./applyFunctionRecursively";

/**
 * Recursively clear the selection state of all items.
 *
 * @param items - The list of items to process.
 * @returns {Diagram[]} - The updated list of items with the selection state cleared.
 */
export const clearSelectionRecursively = (items: Diagram[]): Diagram[] => {
	return applyFunctionRecursively(items, (item) => {
		if (isSelectableData(item) && isTransformativeData(item)) {
			return {
				...item,
				isSelected: false,
				isAncestorSelected: false,
				showTransformControls: false,
				showOutline: false,
			};
		}

		if (isSelectableData(item)) {
			return {
				...item,
				isSelected: false,
				isAncestorSelected: false,
				showOutline: false,
			};
		}

		return item;
	});
};
