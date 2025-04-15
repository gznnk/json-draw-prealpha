import type { PathData } from "./PathTypes";

import {
	DEFAULT_DIAGRAM_BASE_DATA,
	DEFAULT_SELECTABLE_DATA,
	DEFAULT_TRANSFORMATIVE_DATA,
	DEFAULT_ITEMABLE_DATA,
	DEFAULT_STROKABLE_DATA,
} from "../../../../constants/Diagram";

/**
 * Default path data.
 */
export const DEFAULT_PATH_DATA = {
	...DEFAULT_DIAGRAM_BASE_DATA,
	...DEFAULT_SELECTABLE_DATA,
	...DEFAULT_TRANSFORMATIVE_DATA,
	...DEFAULT_ITEMABLE_DATA,
	...DEFAULT_STROKABLE_DATA,
	type: "Path",
} as const satisfies PathData;
