// Import types.
import type { TextState } from "../../../types/state/shapes/TextState";

// Import constants.
import { CreateDefaultState } from "./CreateDefaultState";
import { TextFeatures } from "../../../types/data/shapes/TextData";
import { TextDefaultData } from "../../data/shapes/TextDefaultData";

/**
 * Default state values for Text
 */
export const TextDefaultState: TextState = CreateDefaultState<TextState>({
	type: "Text",
	options: TextFeatures,
	baseData: TextDefaultData,
});