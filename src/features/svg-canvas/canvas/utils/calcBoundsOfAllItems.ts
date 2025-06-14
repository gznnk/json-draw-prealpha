import type { Diagram } from "../../catalog/DiagramTypes";
import { calcBoundsOfGroup } from "../../components/shapes/Group";
import type { Box } from "../../types/base/Box";
import { isItemableData } from "../../utils/validation/isItemableData";
import { isTransformativeData } from "../../utils/validation/isTransformativeData";
import { degreesToRadians } from "../../utils/math/common/degreesToRadians";
import { rotatePoint } from "../../utils/math/points/rotatePoint";

/**
 * Calculate the bounds of all items in the diagram.
 *
 * @param items - The list of items to calculate the bounds for.
 * @returns - The bounds of all items.
 */
export const calcBoundsOfAllItems = (items: Diagram[]): Box => {
	const box = {
		top: Number.MAX_VALUE,
		left: Number.MAX_VALUE,
		right: Number.MIN_VALUE,
		bottom: Number.MIN_VALUE,
	};

	for (const item of items) {
		if (isItemableData(item) && item.type === "Group") {
			// Calculate the bounds of the group.
			const groupBox = calcBoundsOfGroup(item);
			box.top = Math.min(box.top, groupBox.y);
			box.left = Math.min(box.left, groupBox.x);
			box.right = Math.max(box.right, groupBox.x + groupBox.width);
			box.bottom = Math.max(box.bottom, groupBox.y + groupBox.height);
		} else if (isTransformativeData(item)) {
			const radians = degreesToRadians(item.rotation);
			const leftTop = rotatePoint(
				item.x - item.width / 2,
				item.y - item.height / 2,
				item.x,
				item.y,
				radians,
			);
			const rightBottom = rotatePoint(
				item.x + item.width / 2,
				item.y + item.height / 2,
				item.x,
				item.y,
				radians,
			);
			box.top = Math.min(box.top, leftTop.y);
			box.left = Math.min(box.left, leftTop.x);
			box.right = Math.max(box.right, rightBottom.x);
			box.bottom = Math.max(box.bottom, rightBottom.y);
		}
	}

	return box;
};
