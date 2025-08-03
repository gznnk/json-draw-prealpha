import { createStateToDataMapper } from "../../core/createStateToDataMapper";
import { WebSearchNodeDefaultData } from "../../../constants/data/nodes/WebSearchNodeDefaultData";
import type { WebSearchNodeData } from "../../../types/data/nodes/WebSearchNodeData";
import type { WebSearchNodeState } from "../../../types/state/nodes/WebSearchNodeState";

export const mapWebSearchNodeStateToData = createStateToDataMapper<WebSearchNodeData>(
	WebSearchNodeDefaultData,
);

export const webSearchNodeStateToData = (state: WebSearchNodeState): WebSearchNodeData =>
	mapWebSearchNodeStateToData(state);