// Import types.
import type { PathData } from "../../../types/data/shapes/PathData";
import { PathFeatures } from "../../../types/data/shapes/PathData";

// Import helpers.
import { CreateDefaultData } from "./CreateDefaultData";

/**
 * Default path data template.
 * Generated using Features definition and CreateDefaultData helper.
 */
export const PathDefaultData = CreateDefaultData<PathData>({
	type: "Path",
	options: PathFeatures,
	properties: {
		pathType: "Linear",
	},
});