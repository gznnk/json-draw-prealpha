import { DefaultSelectableState } from "../core/DefaultSelectableState";
import { DefaultStrokableState } from "../core/DefaultStrokableState";
import { DefaultFillableState } from "../core/DefaultFillableState";
import { DefaultTextableState } from "../core/DefaultTextableState";
import { DefaultTransformativeState } from "../core/DefaultTransformativeState";
import { DefaultConnectableState } from "../shapes/DefaultConnectableState";
import { SvgToDiagramNodeDefaultData } from "../../data/nodes/SvgToDiagramNodeDefaultData";
import type { SvgToDiagramNodeState } from "../../../types/state/nodes/SvgToDiagramNodeState";

export const DefaultSvgToDiagramNodeState = {
	...SvgToDiagramNodeDefaultData,
	...DefaultSelectableState,
	...DefaultStrokableState,
	...DefaultFillableState,
	...DefaultTextableState,
	...DefaultTransformativeState,
	...DefaultConnectableState,
} as const satisfies SvgToDiagramNodeState;
