import { createDataToStateMapper } from "../../core/createDataToStateMapper";
import { DefaultTextAreaNodeState } from "../../../constants/state/nodes/DefaultTextAreaNodeState";
import type { TextAreaNodeData } from "../../../types/data/nodes/TextAreaNodeData";
import type { TextAreaNodeState } from "../../../types/state/nodes/TextAreaNodeState";

export const mapTextAreaNodeDataToState = createDataToStateMapper<TextAreaNodeState>(
	DefaultTextAreaNodeState,
);

export const textAreaNodeDataToState = (data: TextAreaNodeData): TextAreaNodeState =>
	mapTextAreaNodeDataToState(data);