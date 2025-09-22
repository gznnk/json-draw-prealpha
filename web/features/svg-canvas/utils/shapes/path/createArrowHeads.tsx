import type React from "react";

import { ArrowHead } from "../../../components/core/ArrowHead";
import type { PathData } from "../../../types/data/shapes/PathData";
import { calcRadians } from "../../../utils/math/points/calcRadians";

/**
 * Creates an arrow head at the start point of a path.
 *
 * @param pathData - The path data containing points and arrow styling
 * @returns JSX element for the arrow head or undefined
 */
export const createStartPointArrowHead = (
	pathData: PathData,
): React.ReactNode => {
	if (1 < pathData.items.length) {
		if (pathData.startArrowHead && pathData.startArrowHead !== "None") {
			const startPoint = pathData.items[0];
			const start2thPoint = pathData.items[1];
			const startArrowHeadRadians = calcRadians(
				startPoint.x,
				startPoint.y,
				start2thPoint.x,
				start2thPoint.y,
			);
			return (
				<ArrowHead
					type={pathData.startArrowHead}
					color={pathData.stroke}
					x={startPoint.x}
					y={startPoint.y}
					radians={startArrowHeadRadians}
				/>
			);
		}
	}
	return undefined;
};

/**
 * Creates an arrow head at the end point of a path.
 *
 * @param pathData - The path data containing points and arrow styling
 * @returns JSX element for the arrow head or undefined
 */
export const createEndPointArrowHead = (
	pathData: PathData,
): React.ReactNode => {
	if (1 < pathData.items.length) {
		if (pathData.endArrowHead && pathData.endArrowHead !== "None") {
			const endPoint = pathData.items[pathData.items.length - 1];
			const end2thPoint = pathData.items[pathData.items.length - 2];
			const endArrowHeadRadians = calcRadians(
				endPoint.x,
				endPoint.y,
				end2thPoint.x,
				end2thPoint.y,
			);
			return (
				<ArrowHead
					type={pathData.endArrowHead}
					color={pathData.stroke}
					x={endPoint.x}
					y={endPoint.y}
					radians={endArrowHeadRadians}
				/>
			);
		}
	}
	return undefined;
};
