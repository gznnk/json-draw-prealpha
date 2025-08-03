// Import types.
import type { SvgState } from "../../../types/state/shapes/SvgState";

// Import utils.
import { newId } from "../../../utils/shapes/common/newId";

// Import constants from Svg component.
import { DefaultSvgState } from "../../../constants/state/shapes/DefaultSvgState";

/**
 * Creates svg state with the specified properties.
 */
export const createSvgState = ({
	x,
	y,
	svgText,
	width = 100,
	height = 100,
	rotation = 0,
	scaleX = 1,
	scaleY = 1,
	keepProportion = false,
}: {
	x: number;
	y: number;
	svgText: string;
	width?: number;
	height?: number;
	rotation?: number;
	scaleX?: number;
	scaleY?: number;
	keepProportion?: boolean;
}): SvgState => {
	return {
		...DefaultSvgState,
		id: newId(),
		x,
		y,
		svgText,
		width,
		height,
		rotation,
		scaleX,
		scaleY,
		keepProportion,
		initialWidth: width,
		initialHeight: height,
	} as SvgState;
};