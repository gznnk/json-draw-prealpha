// Import types.
import type { InputState } from "../../../types/state/elements/InputState";

// Import constants.
import { InputDefaultData } from "../../data/elements/InputDefaultData";
import { InputFeatures } from "../../../types/data/elements/InputData";
import { CreateDefaultState } from "../shapes/CreateDefaultState";

/**
 * Default state values for Input
 */
export const InputDefaultState: InputState = CreateDefaultState<InputState>({
	type: "Input",
	options: InputFeatures,
	baseData: InputDefaultData,
});