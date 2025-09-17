// Import types.
import type { Diagram } from "../state/core/Diagram";
import type { EventPhase } from "./EventPhase";

/**
 * Data structure for diagram change events
 */
export type DiagramChangeData = Partial<Diagram>;

/**
 * Event fired when a diagram's properties are changed
 */
export type DiagramChangeEvent = {
	eventId: string;
	eventPhase: EventPhase;
	id: string;
	startDiagram: DiagramChangeData;
	endDiagram: DiagramChangeData;
	cursorX?: number;
	cursorY?: number;
	clientX?: number;
	clientY?: number;
	/** The canvas's min x position */
	minX?: number;
	/** The canvas's min y position */
	minY?: number;
};
