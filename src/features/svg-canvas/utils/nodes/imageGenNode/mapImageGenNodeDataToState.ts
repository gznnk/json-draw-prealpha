import { createDataToStateMapper } from "../../core/createDataToStateMapper";
import { ImageGenNodeDefaultState } from "../../../constants/state/nodes/ImageGenNodeDefaultState";
import type { DiagramData } from "../../../types/data/core/DiagramData";
import type { Diagram } from "../../../types/state/core/Diagram";
import type { ImageGenNodeData } from "../../../types/data/nodes/ImageGenNodeData";
import type { ImageGenNodeState } from "../../../types/state/nodes/ImageGenNodeState";

export const mapImageGenNodeDataToState = createDataToStateMapper<ImageGenNodeState>(
	ImageGenNodeDefaultState,
);

export const imageGenNodeDataToState = (data: DiagramData): Diagram =>
	mapImageGenNodeDataToState(data as ImageGenNodeData);