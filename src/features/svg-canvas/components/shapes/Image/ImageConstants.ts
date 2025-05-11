import type { ImageData } from "../../../types/shapes";

import {
	DEFAULT_DIAGRAM_BASE_DATA,
	DEFAULT_SELECTABLE_DATA,
	DEFAULT_TRANSFORMATIVE_DATA,
} from "../../../constants/Diagram";

/**
 * Default svg data.
 */
export const DEFAULT_IMAGE_DATA = {
	...DEFAULT_DIAGRAM_BASE_DATA,
	...DEFAULT_SELECTABLE_DATA,
	...DEFAULT_TRANSFORMATIVE_DATA,
	type: "Image",
	base64Data: "",
} as const satisfies ImageData;
