import { SelectableDefaultState } from "../core/SelectableDefaultState";
import { StrokableDefaultState } from "../core/StrokableDefaultState";
import { FillableDefaultState } from "../core/FillableDefaultState";
import { TextableDefaultState } from "../core/TextableDefaultState";
import { TransformativeDefaultState } from "../core/TransformativeDefaultState";
import { ConnectableDefaultState } from "../shapes/ConnectableDefaultState";
import { WebSearchNodeDefaultData } from "../../data/nodes/WebSearchNodeDefaultData";
import type { WebSearchNodeState } from "../../../types/state/nodes/WebSearchNodeState";

export const WebSearchNodeDefaultState = {
	...WebSearchNodeDefaultData,
	...SelectableDefaultState,
	...StrokableDefaultState,
	...FillableDefaultState,
	...TextableDefaultState,
	...TransformativeDefaultState,
	...ConnectableDefaultState,
} as const satisfies WebSearchNodeState;
