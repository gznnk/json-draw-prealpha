// Import types.
import type { EventPhase } from "./EventPhase";
import type { DiagramChangeData } from "./DiagramChangeData";

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
};
