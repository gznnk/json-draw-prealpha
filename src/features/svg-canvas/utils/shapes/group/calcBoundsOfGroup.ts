import type { Bounds } from "../../../types/base/Bounds";
import type { GroupData } from "../../../types/data/shapes/GroupData";
import { degreesToRadians } from "../../math/common/degreesToRadians";
import { nanToZero } from "../../math/common/nanToZero";
import { rotatePoint } from "../../math/points/rotatePoint";
import { calcGroupBoundingBoxOfNoRotation } from "./calcGroupBoundingBoxOfNoRotation";

export const calcBoundsOfGroup = (group: GroupData): Bounds => {
	const { items, x, y, rotation } = group;
	const radians = degreesToRadians(rotation);
	const boundingBox = calcGroupBoundingBoxOfNoRotation(items, x, y, rotation);
	const leftTop = rotatePoint(boundingBox.left, boundingBox.top, x, y, radians);
	const rightBottom = rotatePoint(
		boundingBox.right,
		boundingBox.bottom,
		x,
		y,
		radians,
	);

	return {
		x: leftTop.x + nanToZero(rightBottom.x - leftTop.x) / 2,
		y: leftTop.y + nanToZero(rightBottom.y - leftTop.y) / 2,
		width: boundingBox.right - boundingBox.left,
		height: boundingBox.bottom - boundingBox.top,
	};
};
