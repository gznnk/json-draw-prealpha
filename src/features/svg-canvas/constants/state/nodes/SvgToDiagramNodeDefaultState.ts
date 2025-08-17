import { SelectableDefaultState } from "../core/SelectableDefaultState";
import { StrokableDefaultState } from "../core/StrokableDefaultState";
import { FillableDefaultState } from "../core/FillableDefaultState";
import { TextableDefaultState } from "../core/TextableDefaultState";
import { TransformativeDefaultState } from "../core/TransformativeDefaultState";
import { ConnectableDefaultState } from "../shapes/ConnectableDefaultState";
import { SvgToDiagramNodeDefaultData } from "../../data/nodes/SvgToDiagramNodeDefaultData";
import type { SvgToDiagramNodeState } from "../../../types/state/nodes/SvgToDiagramNodeState";

export const SvgToDiagramNodeDefaultState = {
	...SvgToDiagramNodeDefaultData,
	...SelectableDefaultState,
	...StrokableDefaultState,
	...FillableDefaultState,
	...TextableDefaultState,
	...TransformativeDefaultState,
	...ConnectableDefaultState,
} as const satisfies SvgToDiagramNodeState;
