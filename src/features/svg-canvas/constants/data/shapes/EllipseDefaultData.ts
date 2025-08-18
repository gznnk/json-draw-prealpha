// Import types.
import type { EllipseData } from "../../../types/data/shapes/EllipseData";
import { EllipseFeatures } from "../../../types/data/shapes/EllipseData";

// Import helpers.
import { CreateDefaultData } from "./CreateDefaultData";

/**
 * Default ellipse data template.
 * Generated using Features definition and CreateDefaultData helper.
 */
export const EllipseDefaultData = CreateDefaultData<EllipseData>({
	type: "Ellipse",
	options: EllipseFeatures,
});
