import { createStateToDataMapper } from "../../core/createStateToDataMapper";
import { SvgToDiagramNodeDefaultData } from "../../../constants/data/nodes/SvgToDiagramNodeDefaultData";
import type { SvgToDiagramNodeData } from "../../../types/data/nodes/SvgToDiagramNodeData";
import type { SvgToDiagramNodeState } from "../../../types/state/nodes/SvgToDiagramNodeState";

export const mapSvgToDiagramNodeStateToData = createStateToDataMapper<SvgToDiagramNodeData>(
	SvgToDiagramNodeDefaultData,
);

export const svgToDiagramNodeStateToData = (state: SvgToDiagramNodeState): SvgToDiagramNodeData =>
	mapSvgToDiagramNodeStateToData(state);