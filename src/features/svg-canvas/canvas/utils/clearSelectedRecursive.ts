import type { Diagram } from "../../catalog/DiagramTypes";
import { isSelectableData } from "../../utils/validation/isSelectableData";
import { applyRecursive } from "./applyRecursive";

/**
 * Recursively clear the selection state of all items.
 *
 * @param items - The list of items to process.
 * @returns {Diagram[]} - The updated list of items with the selection state cleared.
 */
export const clearSelectedRecursive = (items: Diagram[]) => {
	return applyRecursive(items, (item) =>
		isSelectableData(item)
			? { ...item, isSelected: false, isMultiSelectSource: false } // 全ての図形の選択状態を解除し、かつ表示状態を元に戻す
			: item,
	);
};
