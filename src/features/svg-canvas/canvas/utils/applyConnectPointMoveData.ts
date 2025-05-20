import type { ConnectableData } from "../../types/data/shapes/ConnectableData";
import type { ConnectPointData } from "../../types/data/shapes/ConnectPointData";
import type { ConnectPointMoveData } from "../../types/events/ConnectPointMoveData";

/**
 * Apply the connect point move data to the new item.
 *
 * Note: This is an **impure** function — it mutates the `newItem` argument directly.
 *
 * @param newItem - The new item to which the connect point data will be applied.
 * @param connectPoints - The connect point move data to be applied.
 */
export const applyConnectPointMoveData = (
	newItem: ConnectableData,
	connectPoints: ConnectPointMoveData[],
) => {
	newItem.connectPoints = connectPoints.map((c) => ({
		...c,
		type: "ConnectPoint",
	})) as ConnectPointData[];
};
