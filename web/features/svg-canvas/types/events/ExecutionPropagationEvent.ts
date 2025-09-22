import type { EventPhase } from "./EventPhase";
import type { ExecuteResult } from "./ExecuteResult";

/**
 * Event for propagating execution results between connected nodes
 */
export type ExecutionPropagationEvent = {
	eventId: string;
	eventPhase: EventPhase;
	id: string;
	targetId: string[];
	data: ExecuteResult;
};
