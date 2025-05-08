// Import types related to SvgCanvas.
import type { Diagram } from "../../../../types/DiagramCatalog";

// Import functions related to SvgCanvas.
import { isItemableData, isTextableData } from "../../../../utils";

export const getTextEditingItem = (items: Diagram[]): Diagram | undefined => {
	for (const item of items) {
		if (isTextableData(item) && item.isTextEditing) {
			return item;
		}
		if (isItemableData(item)) {
			const childItem = getTextEditingItem(item.items);
			if (childItem) {
				return childItem;
			}
		}
	}
};
