import type { DiagramType } from "../base/DiagramType";

/**
 * Event type for new diagram creation.
 */
export type NewDiagramEvent = {
	eventId: string;
	diagramType: DiagramType;
	x?: number;
	y?: number;
	isSelected?: boolean;
};
