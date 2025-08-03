import { createStateToDataMapper } from "../../core/createStateToDataMapper";
import { TextAreaNodeDefaultData } from "../../../constants/data/nodes/TextAreaNodeDefaultData";
import type { TextAreaNodeData } from "../../../types/data/nodes/TextAreaNodeData";
import type { TextAreaNodeState } from "../../../types/state/nodes/TextAreaNodeState";

export const mapTextAreaNodeStateToData = createStateToDataMapper<TextAreaNodeData>(
	TextAreaNodeDefaultData,
);

export const textAreaNodeStateToData = (state: TextAreaNodeState): TextAreaNodeData =>
	mapTextAreaNodeStateToData(state);