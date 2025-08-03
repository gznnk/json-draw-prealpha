import { createStateToDataMapper } from "../../core/createStateToDataMapper";
import { ImageGenNodeDefaultData } from "../../../constants/data/nodes/ImageGenNodeDefaultData";
import type { ImageGenNodeData } from "../../../types/data/nodes/ImageGenNodeData";
import type { ImageGenNodeState } from "../../../types/state/nodes/ImageGenNodeState";

export const mapImageGenNodeStateToData = createStateToDataMapper<ImageGenNodeData>(
	ImageGenNodeDefaultData,
);

export const imageGenNodeStateToData = (state: ImageGenNodeState): ImageGenNodeData =>
	mapImageGenNodeStateToData(state);