import type { EventPhase } from "./EventPhase";
import type { Frame } from "../core/Frame";
import type { TransformationType } from "../core/TransformationType";

/**
 * Event fired during diagram transformation operations such as resizing or rotating.
 * Contains information about the element's shape before and after transformation.
 */
export type DiagramTransformEvent = {
	eventId: string;
	id: string;
	eventPhase: EventPhase;
	transformationType: TransformationType;
	startFrame: Frame;
	endFrame: Frame;
	cursorX: number;
	cursorY: number;
	/** The cursor's x position in client coordinates */
	clientX: number;
	/** The cursor's y position in client coordinates */
	clientY: number;
	minX?: number;
	minY?: number;
};
