import { DefaultSelectableState } from "../core/DefaultSelectableState";
import { DefaultStrokableState } from "../core/DefaultStrokableState";
import { DefaultFillableState } from "../core/DefaultFillableState";
import { DefaultTextableState } from "../core/DefaultTextableState";
import { DefaultTransformativeState } from "../core/DefaultTransformativeState";
import { DefaultConnectableState } from "../shapes/DefaultConnectableState";
import { AgentNodeDefaultData } from "../../data/nodes/AgentNodeDefaultData";
import type { AgentNodeState } from "../../../types/state/nodes/AgentNodeState";

export const DefaultAgentNodeState = {
	...AgentNodeDefaultData,
	...DefaultSelectableState,
	...DefaultStrokableState,
	...DefaultFillableState,
	...DefaultTextableState,
	...DefaultTransformativeState,
	...DefaultConnectableState,
} as const satisfies AgentNodeState;
