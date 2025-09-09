// Import types.
import type { DiagramData } from "../../types/data/catalog/DiagramData";
import type { Diagram } from "../../types/state/catalog/Diagram";
import type { SvgCanvasData } from "../types/SvgCanvasData";
import type { SvgCanvasState } from "../types/SvgCanvasState";

// Import resistry.
import { DiagramRegistry } from "../../registry";

// Import utils.
import { isItemableData } from "../../utils/validation/isItemableData";
import { isItemableState } from "../../utils/validation/isItemableState";

/**
 * Helper function to recursively convert state items to data format.
 *
 * @param items - Array of state items to convert
 * @returns Array of items in data format
 */
const convertItemsStateToData = (items: Diagram[]): DiagramData[] => {
	return items.map((item) => {
		const stateToDataMapper = DiagramRegistry.getStateToDataMapper(item.type);
		let mappedItem: DiagramData;

		if (stateToDataMapper) {
			mappedItem = stateToDataMapper(item);
		} else {
			// Fallback: return the item as is if no mapper is found
			mappedItem = item;
		}

		// If the original state item has nested items, process them recursively
		if (isItemableState(item) && isItemableData(mappedItem)) {
			const mappedNestedItems = convertItemsStateToData(item.items);
			// Assign the recursively processed items to the mapped item
			mappedItem.items = mappedNestedItems;
		}

		return mappedItem;
	});
};

/**
 * Conversion function from SvgCanvasState to SvgCanvasData.
 * Extracts only the necessary properties included in SvgCanvasData.
 *
 * @param state - Source SvgCanvasState
 * @returns SvgCanvasData object
 */
export const svgCanvasStateToData = (state: SvgCanvasState): SvgCanvasData => {
	return {
		id: state.id,
		minX: state.minX,
		minY: state.minY,
		zoom: state.zoom,
		items: convertItemsStateToData(state.items),
	};
};
