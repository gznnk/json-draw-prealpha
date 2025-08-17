import { SelectableDefaultState } from "../core/SelectableDefaultState";
import { StrokableDefaultState } from "../core/StrokableDefaultState";
import { FillableDefaultState } from "../core/FillableDefaultState";
import { TextableDefaultState } from "../core/TextableDefaultState";
import { TransformativeDefaultState } from "../core/TransformativeDefaultState";
import { ConnectableDefaultState } from "../shapes/ConnectableDefaultState";
import { AgentNodeDefaultData } from "../../data/nodes/AgentNodeDefaultData";
import type { AgentNodeState } from "../../../types/state/nodes/AgentNodeState";

export const AgentNodeDefaultState = {
	...AgentNodeDefaultData,
	...SelectableDefaultState,
	...StrokableDefaultState,
	...FillableDefaultState,
	...TextableDefaultState,
	...TransformativeDefaultState,
	...ConnectableDefaultState,
} as const satisfies AgentNodeState;
