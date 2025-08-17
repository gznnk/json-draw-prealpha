import type { SvgToDiagramNodeData } from "../../../types/data/nodes/SvgToDiagramNodeData";
import { RectangleDefaultData } from "../shapes/RectangleDefaultData";

/**
 * Default SVG to diagram node data template.
 * Used for State to Data conversion mapping.
 */
export const SvgToDiagramNodeDefaultData = {
	...RectangleDefaultData,
	type: "SvgToDiagramNode",
} as const satisfies SvgToDiagramNodeData;