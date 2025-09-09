import { createStateToDataMapper } from "../../core/createStateToDataMapper";
import { SvgToDiagramNodeDefaultData } from "../../../constants/data/nodes/SvgToDiagramNodeDefaultData";
import type { SvgToDiagramNodeData } from "../../../types/data/nodes/SvgToDiagramNodeData";
import type { SvgToDiagramNodeState } from "../../../types/state/nodes/SvgToDiagramNodeState";
import type { Diagram } from "../../../types/state/core/Diagram";
import type { DiagramData } from "../../../types/data/core/DiagramData";

export const mapSvgToDiagramNodeStateToData =
	createStateToDataMapper<SvgToDiagramNodeData>(SvgToDiagramNodeDefaultData);

export const svgToDiagramNodeStateToData = (state: Diagram): DiagramData =>
	mapSvgToDiagramNodeStateToData(state as SvgToDiagramNodeState);
