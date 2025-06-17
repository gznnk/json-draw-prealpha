import type { EventType } from "./EventType";

/**
 * Event fired during area selection operations
 */
export type AreaSelectionEvent = {
	eventId: string;
	eventType: EventType;
	startX: number;
	startY: number;
	endX: number;
	endY: number;
	isActive: boolean;
};
