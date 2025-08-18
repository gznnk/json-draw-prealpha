// Import types.
import { ImageGenNodeFeatures } from "../../../types/data/nodes/ImageGenNodeData";
import type { ImageGenNodeState } from "../../../types/state/nodes/ImageGenNodeState";

// Import constants.
import { ImageGenNodeDefaultData } from "../../data/nodes/ImageGenNodeDefaultData";

// Import helpers.
import { CreateDefaultState } from "../shapes/CreateDefaultState";

/**
 * Default image generation node state template.
 */
export const ImageGenNodeDefaultState = CreateDefaultState<ImageGenNodeState>({
	type: "ImageGenNode",
	options: ImageGenNodeFeatures,
	baseData: ImageGenNodeDefaultData,
	properties: {},
});
