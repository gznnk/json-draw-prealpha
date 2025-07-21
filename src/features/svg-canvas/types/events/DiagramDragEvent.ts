import type { EventType } from "./EventType";

/**
 * Event fired during diagram dragging operations
 */
export type DiagramDragEvent = {
	eventId: string;
	eventType: EventType;
	id: string;
	/** The diagram's x position at the start of the drag */
	startX: number;
	/** The diagram's y position at the start of the drag */
	startY: number;
	/** The diagram's x position at the end of the drag */
	endX: number;
	/** The diagram's y position at the end of the drag */
	endY: number;
	/** The cursor's x position at the start of the drag (in SVG coordinates) */
	cursorX: number;
	/** The cursor's y position at the start of the drag (in SVG coordinates) */
	cursorY: number;
	minX?: number;
	minY?: number;
	isFromAutoEdgeScroll?: boolean;
};
