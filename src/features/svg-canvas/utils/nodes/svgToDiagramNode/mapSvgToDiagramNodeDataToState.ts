import { createDataToStateMapper } from "../../core/createDataToStateMapper";
import { SvgToDiagramNodeDefaultState } from "../../../constants/state/nodes/SvgToDiagramNodeDefaultState";
import type { SvgToDiagramNodeData } from "../../../types/data/nodes/SvgToDiagramNodeData";
import type { SvgToDiagramNodeState } from "../../../types/state/nodes/SvgToDiagramNodeState";

export const mapSvgToDiagramNodeDataToState =
	createDataToStateMapper<SvgToDiagramNodeState>(SvgToDiagramNodeDefaultState);

export const svgToDiagramNodeDataToState = (
	data: SvgToDiagramNodeData,
): SvgToDiagramNodeState => mapSvgToDiagramNodeDataToState(data);
