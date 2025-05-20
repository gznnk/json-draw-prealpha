import type { Diagram } from "../../catalog/DiagramTypes";
import type { ConnectPointMoveData } from "../../types/events/ConnectPointMoveData";
import { isItemableData } from "../../utils/validation/isItemableData";
import { updateConnectPointsAndCollect } from "./updateConnectPointsAndCollect";

/**
 * Recursively updates connect points for a diagram and all its child items,
 * collecting move data for all connect points.
 *
 * @param newItem - The diagram item to update connect points for recursively.
 * @param connectPointMoveDataList - List to collect connect point move data.
 */
export const updateConnectPointsAndCollectRecursive = (
	newItem: Diagram,
	connectPointMoveDataList: ConnectPointMoveData[],
): void => {
	updateConnectPointsAndCollect(newItem, connectPointMoveDataList);
	if (isItemableData(newItem)) {
		for (const childItem of newItem.items) {
			updateConnectPointsAndCollectRecursive(
				childItem,
				connectPointMoveDataList,
			);
		}
	}
};
