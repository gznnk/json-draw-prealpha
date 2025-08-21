// Import types.
import type { TextFeatures } from "../../data/shapes/TextData";
import type { TextState } from "../../state/shapes/TextState";
import type { CreateDiagramProps } from "./CreateDiagramProps";

/**
 * Props for Text component
 */
export type TextProps = CreateDiagramProps<
	TextState,
	typeof TextFeatures
>;