// Import types.
import type { Optional } from "../../../../../shared/utility-types";
import type { ButtonFeatures } from "../../data/elements/ButtonData";
import type { ButtonState } from "../../state/elements/ButtonState";
import type { CreateDiagramProps } from "../shapes/CreateDiagramProps";

/**
 * Props for Button component
 */
export type ButtonProps = Optional<
	CreateDiagramProps<ButtonState, typeof ButtonFeatures>,
	| "cornerRadius"
	| "fill"
	| "stroke"
	| "strokeWidth"
	| "fontSize"
	| "fontColor"
	| "fontWeight"
	| "fontFamily"
	| "textAlign"
	| "verticalAlign"
	| "textType"
>;
