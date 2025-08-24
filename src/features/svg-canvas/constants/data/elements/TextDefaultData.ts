// Import types.
import type { TextData } from "../../../types/data/elements/TextData";

// Import constants.
import { CreateDefaultData } from "../shapes/CreateDefaultData";
import { TextFeatures } from "../../../types/data/elements/TextData";

/**
 * Default data values for Text
 */
export const TextDefaultData: TextData = CreateDefaultData<TextData>({
	type: "Text",
	options: TextFeatures,
	properties: {
		width: 100,
		height: 100,
		rotation: 0,
		scaleX: 1,
		scaleY: 1,
	},
});
