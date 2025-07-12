import type { EventType } from "./EventType";
import type { Shape } from "../base/Shape";

/**
 * Event fired during diagram transformation operations such as resizing or rotating.
 * Contains information about the element's shape before and after transformation.
 */
export type DiagramTransformEvent = {
	eventId: string;
	id: string;
	eventType: EventType;
	startShape: Shape;
	endShape: Shape;
	cursorX: number;
	cursorY: number;
	minX?: number;
	minY?: number;
	isFromAutoEdgeScroll?: boolean;
};
