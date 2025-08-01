// Import types.
import type { Diagram } from "../../types/data/catalog/Diagram";

// Import utils.
import { isTransformativeData } from "../../utils/validation/isTransformativeData";
import { applyFunctionRecursively } from "./applyFunctionRecursively";

/**
 * Removes the showTransformControls property from non-transformative items in a Diagram tree.
 *
 * @param items - Diagram items array
 * @returns Diagram[] with showTransformControls removed from non-transformative items
 */
export const removeNonTransformativeShowTransformControls = (
	items: Diagram[],
): Diagram[] => {
	return applyFunctionRecursively(items, (item) => {
		if (!isTransformativeData(item) && "showTransformControls" in item) {
			const { showTransformControls: _showTransformControls, ...rest } = item as Diagram & {
				showTransformControls: boolean;
			};
			return {
				...rest,
			};
		}
		return item;
	});
};
