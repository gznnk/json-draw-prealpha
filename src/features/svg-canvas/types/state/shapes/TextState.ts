// Import types.
import type {
	TextData,
	TextFeatures,
} from "../../data/shapes/TextData";
import type { CreateStateType } from "./CreateStateType";

/**
 * State type for Text shapes.
 * Contains properties specific to Text diagram elements.
 */
export type TextState = CreateStateType<
	TextData,
	typeof TextFeatures
>;