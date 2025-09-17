// Import types.
import { LLMNodeFeatures } from "../../../types/data/nodes/LLMNodeData";
import type { LLMNodeState } from "../../../types/state/nodes/LLMNodeState";

// Import constants.
import { LLMNodeDefaultData } from "../../data/nodes/LLMNodeDefaultData";
import {
	MIN_WIDTH,
	MIN_HEIGHT,
} from "../../styling/nodes/LLMNodeStyling";

// Import helpers.
import { CreateDefaultState } from "../shapes/CreateDefaultState";

/**
 * Default LLM node state template.
 */
export const LLMNodeDefaultState = CreateDefaultState<LLMNodeState>({
	type: "LLMNode",
	options: LLMNodeFeatures,
	baseData: LLMNodeDefaultData,
	properties: {
		itemableType: "concrete",
		minWidth: MIN_WIDTH,
		minHeight: MIN_HEIGHT,
	},
});
