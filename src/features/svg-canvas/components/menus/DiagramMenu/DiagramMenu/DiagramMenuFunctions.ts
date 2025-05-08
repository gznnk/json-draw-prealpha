// Import types related to SvgCanvas.
import type { Diagram } from "../../../../types/DiagramCatalog";

// Import functions related to SvgCanvas.
import {
	isFillableData,
	isItemableData,
	isStrokableData,
	isTextableData,
} from "../../../../utils";

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

export const findFirstStrokableRecursive = (
	items: Diagram[],
): Diagram | undefined => {
	for (const item of items) {
		if (isStrokableData(item)) {
			return item;
		}
		if (isItemableData(item)) {
			const foundItem = findFirstStrokableRecursive(item.items);
			if (foundItem) {
				return foundItem;
			}
		}
	}
	return undefined;
};

export const findFirstRectangleRecursive = (
	items: Diagram[],
): Diagram | undefined => {
	for (const item of items) {
		if (item.type === "Rectangle") {
			return item;
		}
		if (isItemableData(item)) {
			const foundItem = findFirstRectangleRecursive(item.items);
			if (foundItem) {
				return foundItem;
			}
		}
	}
	return undefined;
};

export const findFirstBorderRadiusRecursive = (
	items: Diagram[],
): Diagram | undefined => {
	for (const item of items) {
		if ("radius" in item) {
			return item;
		}
		if (isItemableData(item)) {
			const foundItem = findFirstBorderRadiusRecursive(item.items);
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
