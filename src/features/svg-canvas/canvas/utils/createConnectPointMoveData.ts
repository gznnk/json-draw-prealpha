import { DiagramRegistry } from "../../registry";
import type { Diagram } from "../../catalog/DiagramTypes";
import type { ConnectPointMoveData } from "../../types/events/ConnectPointMoveData";
import { isConnectableData } from "../../utils/validation/isConnectableData";

/**
 * Create connect point move data for the new item.
 *
 * @param newItem - The new item for which to create connect point move data.
 * @returns {ConnectPointMoveData[]} - The connect point move data for the new item.
 */
export const createConnectPointMoveData = (
	newItem: Diagram,
): ConnectPointMoveData[] => {
	if (isConnectableData(newItem)) {
		// 複数選択の選択元かどうかに関わらず、全ての接続可能な図形の接続ポイントを処理する
		const calculator = DiagramRegistry.getConnectPointCalculator(newItem.type);
		return calculator ? calculator(newItem) : [];
	}

	return [];
};
