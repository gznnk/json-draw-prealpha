import type { VectorStoreNodeData } from "../../../types/data/nodes/VectorStoreNodeData";
import { RectangleDefaultData } from "../shapes/RectangleDefaultData";

/**
 * Default vector store node data template.
 * Used for State to Data conversion mapping.
 */
export const VectorStoreNodeDefaultData = {
	...RectangleDefaultData,
	type: "VectorStoreNode",
} as const satisfies VectorStoreNodeData;