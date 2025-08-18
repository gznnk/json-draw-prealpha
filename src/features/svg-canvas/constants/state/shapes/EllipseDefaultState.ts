// Import types.
import { EllipseFeatures } from "../../../types/data/shapes/EllipseData";
import { EllipseDefaultData } from "../../data/shapes/EllipseDefaultData";

// Import constants.
import type { EllipseState } from "../../../types/state/shapes/EllipseState";

// Import helpers.
import { CreateDefaultState } from "./CreateDefaultState";

export const EllipseDefaultState = CreateDefaultState<EllipseState>({
	type: "Ellipse",
	options: EllipseFeatures,
	baseData: EllipseDefaultData,
});
