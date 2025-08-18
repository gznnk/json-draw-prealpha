// Import types.
import { PageDesignNodeFeatures } from "../../../types/data/nodes/PageDesignNodeData";
import type { PageDesignNodeState } from "../../../types/state/nodes/PageDesignNodeState";

// Import constants.
import { PageDesignNodeDefaultData } from "../../data/nodes/PageDesignNodeDefaultData";

// Import helpers.
import { CreateDefaultState } from "../shapes/CreateDefaultState";

/**
 * Default page design node state template.
 */
export const PageDesignNodeDefaultState =
	CreateDefaultState<PageDesignNodeState>({
		type: "PageDesignNode",
		options: PageDesignNodeFeatures,
		baseData: PageDesignNodeDefaultData,
		properties: {},
	});
