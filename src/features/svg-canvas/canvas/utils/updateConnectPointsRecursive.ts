import type { Diagram } from "../../types/data/catalog/Diagram";
import { isItemableData } from "../../utils/validation/isItemableData";
import { updateConnectPoints } from "./updateConnectPoints";

/**
 * Recursively updates connect points for a diagram and all its child items.
 *
 * @param newItem - The diagram item to update connect points for recursively.
 */
export const updateConnectPointsRecursive = (newItem: Diagram): void => {
	updateConnectPoints(newItem);
	if (isItemableData(newItem)) {
		for (const childItem of newItem.items) {
			updateConnectPointsRecursive(childItem);
		}
	}
};
