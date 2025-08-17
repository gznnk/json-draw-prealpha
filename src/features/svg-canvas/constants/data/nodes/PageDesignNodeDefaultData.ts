import type { PageDesignNodeData } from "../../../types/data/nodes/PageDesignNodeData";
import { RectangleDefaultData } from "../shapes/RectangleDefaultData";

/**
 * Default page design node data template.
 * Used for State to Data conversion mapping.
 */
export const PageDesignNodeDefaultData = {
	...RectangleDefaultData,
	type: "PageDesignNode",
} as const satisfies PageDesignNodeData;