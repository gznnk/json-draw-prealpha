// Import types.
import type { PathState } from "../../../types/state/shapes/PathState";
import type { PathPointData } from "../../../types/data/shapes/PathPointData";

// Import utils.
import { newId } from "../../../utils/shapes/common/newId";

// Import constants from Path component.
import { DEFAULT_PATH_STATE } from "../../../constants/DefaultState";

/**
 * Creates path state with the specified properties.
 *
 * @param params - Path parameters including position and styling
 * @returns The created path state object
 */
export const createPathState = ({
	x = 0,
	y = 0,
	stroke = "black",
	strokeWidth = "1px",
}: {
	x?: number;
	y?: number;
	stroke?: string;
	strokeWidth?: string;
}): PathState => {
	return {
		...DEFAULT_PATH_STATE,
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