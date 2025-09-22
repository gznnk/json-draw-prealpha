import { mapDiagramDataToState } from "./mapDiagramDataToState";
import type { DiagramData } from "../../types/data/core/DiagramData";
import type { Diagram } from "../../types/state/core/Diagram";
import { isItemableData } from "../../utils/validation/isItemableData";
import { isItemableState } from "../../utils/validation/isItemableState";

/**
 * Converts a list of DiagramData items to Diagram state format.
 * Applies the conversion recursively to handle nested structures.
 *
 * @param items - Array of DiagramData items to convert
 * @returns Array of Diagram items in state format
 */
export const diagramDataListToDiagramList = (
	items: DiagramData[],
): Diagram[] => {
	return items.map((item) => {
		const mappedItem = mapDiagramDataToState(item);

		// If the original data item has nested items, process them recursively
		if (isItemableData(item) && isItemableState(mappedItem)) {
			const mappedNestedItems = diagramDataListToDiagramList(item.items);
			// Assign the recursively processed items to the mapped item
			mappedItem.items = mappedNestedItems;
		}

		return mappedItem;
	});
};
