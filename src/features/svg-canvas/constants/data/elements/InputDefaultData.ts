// Import types.
import type { InputData } from "../../../types/data/elements/InputData";

// Import constants.
import { InputFeatures } from "../../../types/data/elements/InputData";
import { CreateDefaultData } from "../shapes/CreateDefaultData";

/**
 * Default data values for Input
 */
export const InputDefaultData: InputData = CreateDefaultData<InputData>({
	type: "Input",
	options: InputFeatures,
	properties: {},
});