import type { EventType } from "./EventType";
import type { Shape } from "../core/Shape";
import type { TransformationType } from "../core/TransformationType";

/**
 * Event fired during diagram transformation operations such as resizing or rotating.
 * Contains information about the element's shape before and after transformation.
 */
export type DiagramTransformEvent = {
	eventId: string;
	id: string;
	eventType: EventType;
	transformationType: TransformationType;
	startShape: Shape;
	endShape: Shape;
	cursorX: number;
	cursorY: number;
	/** The cursor's x position in client coordinates */
	clientX: number;
	/** The cursor's y position in client coordinates */
	clientY: number;
	minX?: number;
	minY?: number;
	isFromAutoEdgeScroll?: boolean;
};
