// Import types.
import type { NodeHeaderState } from "../../../types/state/elements/NodeHeaderState";

// Import constants.
import { CreateDefaultState } from "../shapes/CreateDefaultState";
import { NodeHeaderFeatures } from "../../../types/data/elements/NodeHeaderData";
import { NodeHeaderDefaultData } from "../../data/elements/NodeHeaderDefaultData";

/**
 * Default state values for NodeHeader
 */
export const NodeHeaderDefaultState: NodeHeaderState = CreateDefaultState<NodeHeaderState>({
	type: "NodeHeader",
	options: NodeHeaderFeatures,
	baseData: NodeHeaderDefaultData,
});