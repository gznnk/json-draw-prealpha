// Import types.
import type {
	TextData,
	TextFeatures,
} from "../../data/elements/TextData";
import type { CreateStateType } from "../shapes/CreateStateType";

/**
 * State type for Text shapes.
 * Contains properties specific to Text diagram elements.
 */
export type TextState = CreateStateType<
	TextData,
	typeof TextFeatures
>;