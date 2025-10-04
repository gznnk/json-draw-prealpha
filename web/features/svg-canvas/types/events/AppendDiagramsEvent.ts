import type { Diagram } from "../state/core/Diagram";

/**
 * Event for appending multiple diagrams to a target diagram via drag and drop.
 * Contains the target ID and the diagrams to be appended.
 */
export type AppendDiagramsEvent = {
	eventId: string;
	targetId: string;
	diagrams: Diagram[];
	/**
	 * Whether diagram coordinates are absolute or relative to the target.
	 * - true: Coordinates are absolute and should be transformed to relative
	 * - false: Coordinates are already relative to the target (no transformation needed)
	 * @default true
	 */
	useAbsoluteCoordinates?: boolean;
};