import { DefaultEllipseState } from "../shapes/DefaultEllipseState";
import type { SvgToDiagramNodeState } from "../../../types/state/nodes/SvgToDiagramNodeState";

export const DefaultSvgToDiagramNodeState = {
	...DefaultEllipseState,
	type: "SvgToDiagramNode",
} as const satisfies SvgToDiagramNodeState;