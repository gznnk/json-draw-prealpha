import type { Diagram } from "../../types/data/catalog/Diagram";
import { isItemableData } from "../../utils/validation/isItemableData";
import type { SvgCanvasState } from "../SvgCanvasTypes";

export const isGroupedItem = (
	item: Diagram,
	canvasState: SvgCanvasState,
): boolean => {
	if (canvasState.items.some((canvasItem) => canvasItem.id === item.id)) {
		return false;
	}
	for (const canvasItem of canvasState.items) {
		if (canvasItem.type === "Group" && isItemableData(canvasItem)) {
			return isGroupedItemInternal(item, canvasItem.items);
		}
	}
	return false;
};

const isGroupedItemInternal = (item: Diagram, items: Diagram[]): boolean => {
	if (items.some((canvasItem) => canvasItem.id === item.id)) {
		return true;
	}
	for (const canvasItem of items) {
		if (canvasItem.type === "Group" && isItemableData(canvasItem)) {
			return isGroupedItemInternal(item, canvasItem.items);
		}
	}
	return false;
};
