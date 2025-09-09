// Import types.
import type { Diagram } from "../../../../types/state/catalog/Diagram";

// Import utils.
import { isFillableState } from "../../../../utils/validation/isFillableState";
import { isItemableState } from "../../../../utils/validation/isItemableState";
import { isStrokableState } from "../../../../utils/validation/isStrokableState";
import { isTextableState } from "../../../../utils/validation/isTextableState";

export const findFirstFillableRecursive = (
	items: Diagram[],
): Diagram | undefined => {
	for (const item of items) {
		if (isFillableState(item)) {
			return item;
		}
		if (isItemableState(item)) {
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
		if (isStrokableState(item)) {
			return item;
		}
		if (isItemableState(item)) {
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
		if (isItemableState(item)) {
			const foundItem = findFirstRectangleRecursive(item.items);
			if (foundItem) {
				return foundItem;
			}
		}
	}
	return undefined;
};

export const findFirstCornerRoundableRecursive = (
	items: Diagram[],
): Diagram | undefined => {
	for (const item of items) {
		if ("cornerRadius" in item) {
			return item;
		}
		if (isItemableState(item)) {
			const foundItem = findFirstCornerRoundableRecursive(item.items);
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
		if (isTextableState(item)) {
			return item;
		}
		if (isItemableState(item)) {
			const foundItem = findFirstTextableRecursive(item.items);
			if (foundItem) {
				return foundItem;
			}
		}
	}
	return undefined;
};
