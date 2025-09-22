import { applyFunctionRecursively } from "./applyFunctionRecursively";
import type { Diagram } from "../../types/state/core/Diagram";
import { isTransformativeState } from "../../utils/validation/isTransformativeState";

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
		if (!isTransformativeState(item) && "showTransformControls" in item) {
			const { showTransformControls: _showTransformControls, ...rest } =
				item as Diagram & {
					showTransformControls: boolean;
				};
			return {
				...rest,
			};
		}
		return item;
	});
};
