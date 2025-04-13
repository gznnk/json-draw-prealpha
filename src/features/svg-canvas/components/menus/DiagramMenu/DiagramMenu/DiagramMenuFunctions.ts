// Import types related to SvgCanvas.
import type { Diagram } from "../../../../types/DiagramTypes";

// Import functions related to SvgCanvas.
import {
	isFillableData,
	isItemableData,
	isTextableData,
} from "../../../../utils/Diagram";

export const findFirstFillableRecursive = (
	items: Diagram[],
): Diagram | undefined => {
	for (const item of items) {
		if (isFillableData(item)) {
			return item;
		}
		if (isItemableData(item)) {
			const foundItem = findFirstFillableRecursive(item.items);
			if (foundItem) {
				return foundItem;
			}
		}
	}
	return undefined;
};

export const findFirstTextableRecursive = (
	items: Diagram[],
): Diagram | undefined => {
	for (const item of items) {
		if (isTextableData(item)) {
			return item;
		}
		if (isItemableData(item)) {
			const foundItem = findFirstTextableRecursive(item.items);
			if (foundItem) {
				return foundItem;
			}
		}
	}
	return undefined;
};
