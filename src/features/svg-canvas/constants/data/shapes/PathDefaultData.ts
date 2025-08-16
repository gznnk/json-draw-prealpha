import type { PathData } from "../../../types/data/shapes/PathData";
import { DiagramBaseDefaultData } from "../core/DiagramBaseDefaultData";
import { TransformativeDefaultData } from "../core/TransformativeDefaultData";
import { ItemableDefaultData } from "../core/ItemableDefaultData";
import { StrokableDefaultData } from "../core/StrokableDefaultData";

/**
 * Default path data template.
 * Used for State to Data conversion mapping.
 */
export const PathDefaultData = {
	...DiagramBaseDefaultData,
	...TransformativeDefaultData,
	...ItemableDefaultData,
	...StrokableDefaultData,
	type: "Path",
	pathType: "Linear",
} as const satisfies PathData;