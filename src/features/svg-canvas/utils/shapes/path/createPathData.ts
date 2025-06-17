// Import types.
import type { PathData } from "../../../types/data/shapes/PathData";
import type { PathPointData } from "../../../types/data/shapes/PathPointData";

// Import utils.
import { newId } from "../../../utils/shapes/common/newId";

// Import constants from Path component.
import { DEFAULT_PATH_DATA } from "../../../constants/DefaultData";

/**
 * Creates path data with the specified properties.
 *
 * @param params - Path parameters including position and styling
 * @returns The created path data object
 */
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
