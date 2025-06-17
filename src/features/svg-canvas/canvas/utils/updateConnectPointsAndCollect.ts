import type { Diagram } from "../../types/data/catalog/Diagram";
import type { ConnectPointMoveData } from "../../types/events/ConnectPointMoveData";
import { isConnectableData } from "../../utils/validation/isConnectableData";
import { applyConnectPointMoveData } from "./applyConnectPointMoveData";
import { createConnectPointMoveData } from "./createConnectPointMoveData";

/**
 * Updates connect points for a diagram and collects their move data.
 *
 * @param newItem - The diagram item to update connect points for.
 * @param connectPointMoveDataList - List to collect connect point move data.
 */
export const updateConnectPointsAndCollect = (
	newItem: Diagram,
	connectPointMoveDataList: ConnectPointMoveData[],
): void => {
	if (isConnectableData(newItem)) {
		const connectPoints = createConnectPointMoveData(newItem);
		if (connectPoints.length > 0) {
			applyConnectPointMoveData(newItem, connectPoints);

			for (const connectPoint of newItem.connectPoints) {
				connectPointMoveDataList.push({
					id: connectPoint.id,
					x: connectPoint.x,
					y: connectPoint.y,
					name: connectPoint.name,
					ownerId: newItem.id,
					ownerShape: {
						...newItem,
					},
				});
			}
		}
	}
};
