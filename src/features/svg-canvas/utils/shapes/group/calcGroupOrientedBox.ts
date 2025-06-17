// Import types.
import type { Bounds } from "../../../types/base/Bounds";
import type { GroupData } from "../../../types/data/shapes/GroupData";

// Import utils.
import { degreesToRadians } from "../../math/common/degreesToRadians";
import { nanToZero } from "../../math/common/nanToZero";
import { rotatePoint } from "../../math/points/rotatePoint";
import { calcUnrotatedGroupBoundingBox } from "./calcUnrotatedGroupBoundingBox";

/**
 * Calculates the oriented bounding box of a group shape.
 * Returns the bounds that represent the group's position and size considering rotation.
 *
 * @param group - The group data containing items, position, and rotation
 * @returns The oriented bounding box with center position and original dimensions
 */
export const calcGroupOrientedBox = (group: GroupData): Bounds => {
	const { items, x, y, rotation } = group;
	const radians = degreesToRadians(rotation);

	// Calculate bounding box without rotation applied
	const boundingBox = calcUnrotatedGroupBoundingBox(items, x, y, rotation);

	// Rotate corner points around the group center
	const leftTop = rotatePoint(boundingBox.left, boundingBox.top, x, y, radians);
	const rightBottom = rotatePoint(
		boundingBox.right,
		boundingBox.bottom,
		x,
		y,
		radians,
	);

	// Return oriented box with center position and original dimensions
	return {
		x: leftTop.x + nanToZero(rightBottom.x - leftTop.x) / 2,
		y: leftTop.y + nanToZero(rightBottom.y - leftTop.y) / 2,
		width: boundingBox.right - boundingBox.left,
		height: boundingBox.bottom - boundingBox.top,
	};
};
