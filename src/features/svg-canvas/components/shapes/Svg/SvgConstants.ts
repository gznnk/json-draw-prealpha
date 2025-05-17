import type { SvgData } from "../../../types/data/shapes/SvgData";

import {
	DEFAULT_DIAGRAM_BASE_DATA,
	DEFAULT_SELECTABLE_DATA,
	DEFAULT_TRANSFORMATIVE_DATA,
} from "../../../constants/Diagram";

/**
 * Default svg data.
 */
export const DEFAULT_SVG_DATA = {
	...DEFAULT_DIAGRAM_BASE_DATA,
	...DEFAULT_SELECTABLE_DATA,
	...DEFAULT_TRANSFORMATIVE_DATA,
	type: "Svg",
	initialWidth: 100,
	initialHeight: 100,
	svgText: "",
} as const satisfies SvgData;
