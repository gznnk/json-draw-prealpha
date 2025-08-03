import { DefaultRectangleState } from "../shapes/DefaultRectangleState";
import type { SvgToDiagramNodeState } from "../../../types/state/nodes/SvgToDiagramNodeState";

export const DefaultSvgToDiagramNodeState = {
	...DefaultRectangleState,
	type: "SvgToDiagramNode",
} as const satisfies SvgToDiagramNodeState;