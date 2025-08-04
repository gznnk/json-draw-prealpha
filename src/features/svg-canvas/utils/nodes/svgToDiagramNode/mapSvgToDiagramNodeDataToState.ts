import { createDataToStateMapper } from "../../core/createDataToStateMapper";
import { DefaultSvgToDiagramNodeState } from "../../../constants/state/nodes/DefaultSvgToDiagramNodeState";
import type { SvgToDiagramNodeData } from "../../../types/data/nodes/SvgToDiagramNodeData";
import type { SvgToDiagramNodeState } from "../../../types/state/nodes/SvgToDiagramNodeState";

export const mapSvgToDiagramNodeDataToState = createDataToStateMapper<SvgToDiagramNodeState>(
	DefaultSvgToDiagramNodeState,
);

export const svgToDiagramNodeDataToState = (data: SvgToDiagramNodeData): SvgToDiagramNodeState =>
	mapSvgToDiagramNodeDataToState(data);