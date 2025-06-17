// Import types.
import type { Box } from "../../../types/base/Box";
import type { Diagram } from "../../../types/data/catalog/Diagram";

// Import utils.
import { calcGroupOrientedBox } from "../../../utils/shapes/group/calcGroupOrientedBox";
import { isItemableData } from "../../../utils/validation/isItemableData";
import { isTransformativeData } from "../../../utils/validation/isTransformativeData";
import { calcItemBoundingBox } from "./calcItemBoundingBox";

/**
 * Calculate the bounding box of all provided items.
 *
 * @param items - The list of items to calculate the bounding box for.
 * @returns The bounding box that encompasses all provided items.
 */
export const calcItemsBoundingBox = (items: Diagram[]): Box => {
	const box = {
		top: Number.MAX_VALUE,
		left: Number.MAX_VALUE,
		right: Number.MIN_VALUE,
		bottom: Number.MIN_VALUE,
	};

	for (const item of items) {
		if (isItemableData(item) && item.type === "Group") {
			const groupOrientedBox = calcGroupOrientedBox(item);
			box.top = Math.min(box.top, groupOrientedBox.y);
			box.left = Math.min(box.left, groupOrientedBox.x);
			box.right = Math.max(
				box.right,
				groupOrientedBox.x + groupOrientedBox.width,
			);
			box.bottom = Math.max(
				box.bottom,
				groupOrientedBox.y + groupOrientedBox.height,
			);
		} else if (isTransformativeData(item)) {
			const itemBox = calcItemBoundingBox(item);
			box.top = Math.min(box.top, itemBox.top);
			box.left = Math.min(box.left, itemBox.left);
			box.right = Math.max(box.right, itemBox.right);
			box.bottom = Math.max(box.bottom, itemBox.bottom);
		}
	}

	return box;
};
