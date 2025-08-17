import type { AgentNodeData } from "../../../types/data/nodes/AgentNodeData";
import { RectangleDefaultData } from "../shapes/RectangleDefaultData";

/**
 * Default agent node data template.
 * Used for State to Data conversion mapping.
 */
export const AgentNodeDefaultData = {
	...RectangleDefaultData,
	type: "AgentNode",
} as const satisfies AgentNodeData;