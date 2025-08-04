import { createDataToStateMapper } from "../../core/createDataToStateMapper";
import { DefaultImageGenNodeState } from "../../../constants/state/nodes/DefaultImageGenNodeState";
import type { ImageGenNodeData } from "../../../types/data/nodes/ImageGenNodeData";
import type { ImageGenNodeState } from "../../../types/state/nodes/ImageGenNodeState";

export const mapImageGenNodeDataToState = createDataToStateMapper<ImageGenNodeState>(
	DefaultImageGenNodeState,
);

export const imageGenNodeDataToState = (data: ImageGenNodeData): ImageGenNodeState =>
	mapImageGenNodeDataToState(data);