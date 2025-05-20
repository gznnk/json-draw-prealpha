import type { Diagram } from "../../catalog/DiagramTypes";
import { calcBoundsOfGroup } from "../../components/shapes/Group";
import type { Frame } from "../../types/base/Frame";
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
export const calcBoundsOfAllItems = (items: Diagram[]): Frame => {
	const bounds = {
		top: Number.MAX_VALUE,
		left: Number.MAX_VALUE,
		right: Number.MIN_VALUE,
		bottom: Number.MIN_VALUE,
	};

	for (const item of items) {
		if (isItemableData(item) && item.type === "Group") {
			// Calculate the bounds of the group.
			const box = calcBoundsOfGroup(item);
			bounds.top = Math.min(bounds.top, box.y);
			bounds.left = Math.min(bounds.left, box.x);
			bounds.right = Math.max(bounds.right, box.x + box.width);
			bounds.bottom = Math.max(bounds.bottom, box.y + box.height);
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
			bounds.top = Math.min(bounds.top, leftTop.y);
			bounds.left = Math.min(bounds.left, leftTop.x);
			bounds.right = Math.max(bounds.right, rightBottom.x);
			bounds.bottom = Math.max(bounds.bottom, rightBottom.y);
		}
	}

	return bounds;
};
