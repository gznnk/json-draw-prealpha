// Import types.
import type { FrameState } from "../../../types/state/elements/FrameState";

// Import constants.
import { CreateDefaultState } from "../shapes/CreateDefaultState";
import { FrameFeatures } from "../../../types/data/elements/FrameData";
import { FrameDefaultData } from "../../data/elements/FrameDefaultData";

/**
 * Default state values for Frame
 */
export const FrameDefaultState: FrameState = CreateDefaultState<FrameState>({
	type: "Frame",
	options: FrameFeatures,
	baseData: FrameDefaultData,
});