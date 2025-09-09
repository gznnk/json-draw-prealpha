import { createStateToDataMapper } from "../../core/createStateToDataMapper";
import { WebSearchNodeDefaultData } from "../../../constants/data/nodes/WebSearchNodeDefaultData";
import type { WebSearchNodeData } from "../../../types/data/nodes/WebSearchNodeData";
import type { WebSearchNodeState } from "../../../types/state/nodes/WebSearchNodeState";
import type { Diagram } from "../../../types/state/core/Diagram";
import type { DiagramData } from "../../../types/data/core/DiagramData";

export const mapWebSearchNodeStateToData =
	createStateToDataMapper<WebSearchNodeData>(WebSearchNodeDefaultData);

export const webSearchNodeStateToData = (state: Diagram): DiagramData =>
	mapWebSearchNodeStateToData(state as WebSearchNodeState);
