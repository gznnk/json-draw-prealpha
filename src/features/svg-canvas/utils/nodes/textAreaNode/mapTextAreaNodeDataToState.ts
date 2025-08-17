import { createDataToStateMapper } from "../../core/createDataToStateMapper";
import { TextAreaNodeDefaultState } from "../../../constants/state/nodes/TextAreaNodeDefaultState";
import type { TextAreaNodeData } from "../../../types/data/nodes/TextAreaNodeData";
import type { TextAreaNodeState } from "../../../types/state/nodes/TextAreaNodeState";

export const mapTextAreaNodeDataToState =
	createDataToStateMapper<TextAreaNodeState>(TextAreaNodeDefaultState);

export const textAreaNodeDataToState = (
	data: TextAreaNodeData,
): TextAreaNodeState => mapTextAreaNodeDataToState(data);
