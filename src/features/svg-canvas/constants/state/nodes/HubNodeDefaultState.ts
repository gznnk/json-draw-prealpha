// Import types.
import { HubNodeFeatures } from "../../../types/data/nodes/HubNodeData";
import type { HubNodeState } from "../../../types/state/nodes/HubNodeState";

// Import constants.
import { HubNodeDefaultData } from "../../data/nodes/HubNodeDefaultData";

// Import helpers.
import { CreateDefaultState } from "../shapes/CreateDefaultState";

/**
 * Default hub node state template.
 */
export const HubNodeDefaultState = CreateDefaultState<HubNodeState>({
	type: "HubNode",
	options: HubNodeFeatures,
	baseData: HubNodeDefaultData,
	properties: {},
});
