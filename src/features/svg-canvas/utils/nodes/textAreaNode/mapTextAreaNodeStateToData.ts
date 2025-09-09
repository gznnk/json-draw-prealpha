import { createStateToDataMapper } from "../../core/createStateToDataMapper";
import { TextAreaNodeDefaultData } from "../../../constants/data/nodes/TextAreaNodeDefaultData";
import type { TextAreaNodeData } from "../../../types/data/nodes/TextAreaNodeData";
import type { TextAreaNodeState } from "../../../types/state/nodes/TextAreaNodeState";
import type { Diagram } from "../../../types/state/core/Diagram";
import type { DiagramData } from "../../../types/data/catalog/DiagramData";

export const mapTextAreaNodeStateToData =
	createStateToDataMapper<TextAreaNodeData>(TextAreaNodeDefaultData);

export const textAreaNodeStateToData = (state: Diagram): DiagramData =>
	mapTextAreaNodeStateToData(state as TextAreaNodeState);
