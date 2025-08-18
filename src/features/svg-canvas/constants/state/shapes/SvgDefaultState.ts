// Import types.
import type { SvgState } from "../../../types/state/shapes/SvgState";
import { SvgFeatures } from "../../../types/data/shapes/SvgData";

// Import constants.
import { SvgDefaultData } from "../../data/shapes/SvgDefaultData";

// Import helpers.
import { CreateDefaultState } from "./CreateDefaultState";

/**
 * Default SVG state template.
 */
export const SvgDefaultState = CreateDefaultState<SvgState>({
	type: "Svg",
	options: SvgFeatures,
	baseData: SvgDefaultData,
});