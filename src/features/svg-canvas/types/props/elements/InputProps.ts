// Import types.
import type { InputFeatures } from "../../data/elements/InputData";
import type { InputState } from "../../state/elements/InputState";
import type { CreateDiagramProps } from "../shapes/CreateDiagramProps";

/**
 * Props for Input component
 */
export type InputProps = CreateDiagramProps<InputState, typeof InputFeatures>;