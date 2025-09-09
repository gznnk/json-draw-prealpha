// Import types.
import type { Diagram } from "../../types/state/core/Diagram";

// Import utils.
import { isItemableState } from "../../utils/validation/isItemableState";
import { isSelectableState } from "../../utils/validation/isSelectableState";

/**
 * Remove grouped shapes from the shape array
 *
 * @param items Shape array
 * @returns Updated shape array
 */
export const removeGroupedRecursive = (items: Diagram[]) => {
	return items.filter((item) => {
		if (isSelectableState(item) && item.isSelected) {
			return false;
		}
		if (isItemableState(item)) {
			item.items = removeGroupedRecursive(item.items ?? []);
			if (item.type === "Group" && item.items.length === 0) {
				return false;
			}
		}
		return true;
	});
};
