// Import types.
import type { TextState } from "../../../types/state/elements/TextState";

// Import constants.
import { CreateDefaultState } from "../shapes/CreateDefaultState";
import { TextFeatures } from "../../../types/data/elements/TextData";
import { TextDefaultData } from "../../data/elements/TextDefaultData";

/**
 * Default state values for Text
 */
export const TextDefaultState: TextState = CreateDefaultState<TextState>({
	type: "Text",
	options: TextFeatures,
	baseData: TextDefaultData,
});