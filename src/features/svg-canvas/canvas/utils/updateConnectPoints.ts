import type { Diagram } from "../../types/data/catalog/Diagram";
import { isConnectableData } from "../../utils/validation/isConnectableData";
import { applyConnectPointMoveData } from "./applyConnectPointMoveData";
import { createConnectPointMoveData } from "./createConnectPointMoveData";

/**
 * Updates the connect points for a diagram item.
 *
 * @param newItem - The diagram item to update connect points for.
 */
export const updateConnectPoints = (newItem: Diagram): void => {
	if (isConnectableData(newItem)) {
		const connectPoints = createConnectPointMoveData(newItem);
		if (connectPoints.length > 0) {
			applyConnectPointMoveData(newItem, connectPoints);
		}
	}
};
