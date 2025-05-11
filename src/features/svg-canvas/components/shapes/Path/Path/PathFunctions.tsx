// Import types related to SvgCanvas.
import type { Diagram } from "../../../../catalog";

// Import components related to SvgCanvas.
import { ArrowHead } from "../../../core/ArrowHead";

// Import functions related to SvgCanvas.
import { newId } from "../../../../utils/diagram";
import { calcRadians } from "../../../../utils";

// Imports related to this component.
import type { PathPointData } from "../PathPoint";
import { DEFAULT_PATH_DATA } from "./PathConstants";
import type { PathData } from "../../../../types/data";

export const createDValue = (items: Diagram[]) => {
	let d = "";
	for (let i = 0; i < items.length; i++) {
		const item = items[i];
		d += `${i === 0 ? "M" : "L"} ${item.x} ${item.y} `;
	}
	return d;
};

export const createStartPointArrowHead = (pathData: PathData) => {
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
};

export const createEndPointArrowHead = (pathData: PathData) => {
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
};

export const createPathData = ({
	x = 0,
	y = 0,
	stroke = "black",
	strokeWidth = "1px",
}: {
	x?: number;
	y?: number;
	stroke?: string;
	strokeWidth?: string;
}): PathData => {
	return {
		...DEFAULT_PATH_DATA,
		id: newId(),
		x,
		y,
		stroke,
		strokeWidth,
		items: [
			{
				id: newId(),
				type: "PathPoint",
				x: x - 50,
				y: y - 50,
			} as PathPointData,
			{
				id: newId(),
				type: "PathPoint",
				x: x + 50,
				y: y + 50,
			} as PathPointData,
		] as PathPointData[],
	};
};
