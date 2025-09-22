import type { EventPhase } from "./EventPhase";
import type { ExecuteResult } from "./ExecuteResult";

/**
 * Event fired when a diagram executes an operation
 */
export type ExecuteEvent = {
	eventId: string;
	eventPhase: EventPhase;
	id: string;
	data: ExecuteResult;
};
