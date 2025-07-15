import type { DiagramType } from "../core/DiagramType";

/**
 * Event type for new diagram creation.
 */
export type AddDiagramByTypeEvent = {
	eventId: string;
	diagramType: DiagramType;
	x?: number;
	y?: number;
	isSelected?: boolean;
};
