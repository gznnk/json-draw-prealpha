import { createDataToStateMapper } from "../../core/createDataToStateMapper";
import { ImageGenNodeDefaultState } from "../../../constants/state/nodes/ImageGenNodeDefaultState";
import type { ImageGenNodeData } from "../../../types/data/nodes/ImageGenNodeData";
import type { ImageGenNodeState } from "../../../types/state/nodes/ImageGenNodeState";

export const mapImageGenNodeDataToState = createDataToStateMapper<ImageGenNodeState>(
	ImageGenNodeDefaultState,
);

export const imageGenNodeDataToState = (data: ImageGenNodeData): ImageGenNodeState =>
	mapImageGenNodeDataToState(data);