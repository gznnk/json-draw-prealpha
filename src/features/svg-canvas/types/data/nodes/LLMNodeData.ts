// Import types related to SvgCanvas.
import type { RectangleData } from "../shapes/RectangleData";

/**
 * Type of the LLM node data.
 */
export type LLMNodeData = Omit<RectangleData, "type"> & {
	type: "LLMNode";
};
