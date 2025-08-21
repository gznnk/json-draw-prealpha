// Import types.
import type { TextData } from "../../../types/data/shapes/TextData";

// Import constants.
import { CreateDefaultData } from "./CreateDefaultData";
import { TextFeatures } from "../../../types/data/shapes/TextData";

/**
 * Default data values for Text
 */
export const TextDefaultData: TextData = CreateDefaultData<TextData>({
	type: "Text",
	options: TextFeatures,
	properties: {
		width: 200,
		height: 50,
	},
});