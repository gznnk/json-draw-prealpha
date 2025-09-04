// Import types.
import type { Optional } from "../../../../../shared/utility-types";
import type { NodeHeaderFeatures } from "../../data/elements/NodeHeaderData";
import type { NodeHeaderState } from "../../state/elements/NodeHeaderState";
import type { CreateDiagramProps } from "../shapes/CreateDiagramProps";

/**
 * Props for NodeHeader component
 */
export type NodeHeaderProps = Optional<
	CreateDiagramProps<NodeHeaderState, typeof NodeHeaderFeatures, {
		icon: React.ReactNode;
	}>,
	| "height"
	| "fontColor"
	| "fontSize"
	| "fontFamily"
	| "fontWeight"
	| "textAlign"
	| "verticalAlign"
	| "iconBackgroundColor"
>;
