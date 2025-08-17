import type { HubNodeData } from "../../../types/data/nodes/HubNodeData";
import { RectangleDefaultData } from "../shapes/RectangleDefaultData";

/**
 * Default hub node data template.
 * Used for State to Data conversion mapping.
 */
export const HubNodeDefaultData = {
	...RectangleDefaultData,
	type: "HubNode",
} as const satisfies HubNodeData;