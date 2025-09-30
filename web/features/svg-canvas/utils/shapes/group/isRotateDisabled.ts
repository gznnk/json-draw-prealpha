import { hasRotateDisabledItem } from "./hasRotateDisabledItem";
import type { Diagram } from "../../../types/state/core/Diagram";
import { isItemableState } from "../../validation/isItemableState";
import { isTransformativeState } from "../../validation/isTransformativeState";

/**
 * Check if rotation should be disabled for a diagram.
 * Returns true if either:
 * - The diagram itself has rotateEnabled: false
 * - The diagram is an itemable (group) that contains any items with rotateEnabled: false
 *
 * @param diagram - The diagram to check
 * @returns True if rotation should be disabled, false otherwise
 */
export const isRotateDisabled = (diagram: Diagram): boolean => {
	// Check if the diagram itself has rotation disabled
	if (isTransformativeState(diagram) && !diagram.rotateEnabled) {
		return true;
	}

	// Check if it's a group containing items with rotation disabled
	if (isItemableState(diagram) && hasRotateDisabledItem(diagram.items || [])) {
		return true;
	}

	return false;
};
