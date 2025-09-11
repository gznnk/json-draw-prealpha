import { createDataToStateMapper } from "../../core/createDataToStateMapper";
import { SvgToDiagramNodeDefaultState } from "../../../constants/state/nodes/SvgToDiagramNodeDefaultState";
import type { DiagramData } from "../../../types/data/core/DiagramData";
import type { Diagram } from "../../../types/state/core/Diagram";
import type { SvgToDiagramNodeData } from "../../../types/data/nodes/SvgToDiagramNodeData";
import type { SvgToDiagramNodeState } from "../../../types/state/nodes/SvgToDiagramNodeState";

export const mapSvgToDiagramNodeDataToState =
	createDataToStateMapper<SvgToDiagramNodeState>(SvgToDiagramNodeDefaultState);

export const svgToDiagramNodeDataToState = (
	data: DiagramData,
): Diagram => mapSvgToDiagramNodeDataToState(data as SvgToDiagramNodeData);
