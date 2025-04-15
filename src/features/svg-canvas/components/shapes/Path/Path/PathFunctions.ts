// Import types related to SvgCanvas.
import type {
	Diagram,
	PathData,
	PathPointData,
} from "../../../../types/DiagramTypes";

// Import functions related to SvgCanvas.
import { newId } from "../../../../utils/Diagram";

// Imports related to this component.
import { DEFAULT_PATH_DATA } from "./PathConstants";

export const createDValue = (items: Diagram[]) => {
	let d = "";
	for (let i = 0; i < items.length; i++) {
		const item = items[i];
		d += `${i === 0 ? "M" : "L"} ${item.x} ${item.y} `;
	}
	return d;
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
