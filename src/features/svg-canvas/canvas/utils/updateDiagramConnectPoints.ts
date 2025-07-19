import { DiagramRegistry } from "../../registry";
import type { Diagram } from "../../types/data/catalog/Diagram";
import { isConnectableData } from "../../utils/validation/isConnectableData";

/**
 * Update the connect points of a diagram item.
 * @param item Diagram item to update connect points for.
 * @returns Updated diagram item with new connect points.
 */
export const updateDiagramConnectPoints = (item: Diagram): Diagram => {
	if (isConnectableData(item)) {
		const calculator = DiagramRegistry.getConnectPointCalculator(item.type);
		if (calculator) {
			return {
				...item,
				connectPoints: calculator(item),
			};
		}
	}
	return item;
};
