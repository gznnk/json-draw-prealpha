// Import types.
import type { RectangleState } from "../../../types/state/shapes/RectangleState";
import { RectangleFeatures } from "../../../types/data/shapes/RectangleData";

// Import constants.
import { RectangleDefaultData } from "../../data/shapes/RectangleDefaultData";

// Import helpers.
import { CreateDefaultState } from "./CreateDefaultState";

/**
 * Default rectangle state template.
 */
export const RectangleDefaultState = CreateDefaultState<RectangleState>({
	type: "Rectangle",
	options: RectangleFeatures,
	baseData: RectangleDefaultData,
});
