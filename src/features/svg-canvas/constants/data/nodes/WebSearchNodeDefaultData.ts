import type { WebSearchNodeData } from "../../../types/data/nodes/WebSearchNodeData";
import { RectangleDefaultData } from "../shapes/RectangleDefaultData";

/**
 * Default web search node data template.
 * Used for State to Data conversion mapping.
 */
export const WebSearchNodeDefaultData = {
	...RectangleDefaultData,
	type: "WebSearchNode",
} as const satisfies WebSearchNodeData;