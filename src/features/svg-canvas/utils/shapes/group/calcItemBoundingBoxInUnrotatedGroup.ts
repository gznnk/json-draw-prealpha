// Import types.
import type { Diagram } from "../../../types/data/catalog/Diagram";

// Import utils.
import { degreesToRadians } from "../../math/common/degreesToRadians";
import { nanToZero } from "../../math/common/nanToZero";
import { rotatePoint } from "../../math/points/rotatePoint";
import { isTransformativeData } from "../../validation/isTransformativeData";

/**
 * Calculates the bounding box of a shape when the group rotation is removed.
 *
 * @param item - The shape item
 * @param groupCenterX - Group center X coordinate
 * @param groupCenterY - Group center Y coordinate
 * @param groupRotation - Group rotation angle in degrees
 * @returns The shape's bounding box
 */
export const calcItemBoundingBoxInUnrotatedGroup = (
	item: Diagram,
	groupCenterX: number,
	groupCenterY: number,
	groupRotation: number,
) => {
	const groupRadians = degreesToRadians(-groupRotation);

	const inversedCenter = rotatePoint(
		item.x,
		item.y,
		groupCenterX,
		groupCenterY,
		groupRadians,
	);

	if (isTransformativeData(item)) {
		const halfWidth = nanToZero(item.width / 2);
		const halfHeight = nanToZero(item.height / 2);
		const itemRadians = degreesToRadians(item.rotation - groupRotation);

		const leftTop = rotatePoint(
			inversedCenter.x - halfWidth,
			inversedCenter.y - halfHeight,
			inversedCenter.x,
			inversedCenter.y,
			itemRadians,
		);

		const rightTop = rotatePoint(
			inversedCenter.x + halfWidth,
			inversedCenter.y - halfHeight,
			inversedCenter.x,
			inversedCenter.y,
			itemRadians,
		);

		const leftBottom = rotatePoint(
			inversedCenter.x - halfWidth,
			inversedCenter.y + halfHeight,
			inversedCenter.x,
			inversedCenter.y,
			itemRadians,
		);

		const rightBottom = rotatePoint(
			inversedCenter.x + halfWidth,
			inversedCenter.y + halfHeight,
			inversedCenter.x,
			inversedCenter.y,
			itemRadians,
		);

		return {
			top: Math.min(leftTop.y, rightBottom.y, leftBottom.y, rightTop.y),
			left: Math.min(leftTop.x, rightBottom.x, leftBottom.x, rightTop.x),
			bottom: Math.max(leftTop.y, rightBottom.y, leftBottom.y, rightTop.y),
			right: Math.max(leftTop.x, rightBottom.x, leftBottom.x, rightTop.x),
		};
	}

	return {
		top: inversedCenter.y,
		left: inversedCenter.x,
		bottom: inversedCenter.y,
		right: inversedCenter.x,
	};
};
