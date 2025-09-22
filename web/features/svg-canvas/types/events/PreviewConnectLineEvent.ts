import type { EventPhase } from "./EventPhase";
import type { PathState } from "../state/shapes/PathState";

/**
 * Event that represents a preview connection line state change.
 * This event is triggered when the preview connection line should be shown, updated, or hidden.
 */
export type PreviewConnectLineEvent = {
	/**
	 * The type of event that triggered this preview connection line event.
	 */
	eventPhase: EventPhase;
	/**
	 * The path data for the preview connection line.
	 * When undefined, the preview line should be hidden.
	 */
	pathData?: PathState;
};
