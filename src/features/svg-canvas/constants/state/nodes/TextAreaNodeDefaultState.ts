// Import types.
import { TextAreaNodeFeatures } from "../../../types/data/nodes/TextAreaNodeData";
import type { TextAreaNodeState } from "../../../types/state/nodes/TextAreaNodeState";

// Import constants.
import { TextAreaNodeDefaultData } from "../../data/nodes/TextAreaNodeDefaultData";

// Import helpers.
import { CreateDefaultState } from "../shapes/CreateDefaultState";

/**
 * Default text area node state template.
 */
export const TextAreaNodeDefaultState = CreateDefaultState<TextAreaNodeState>({
	type: "TextAreaNode",
	options: TextAreaNodeFeatures,
	baseData: TextAreaNodeDefaultData,
	properties: {
		itemableType: "concrete",
	},
});
