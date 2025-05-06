import type { PathPointData } from "../components/shapes/Path";
import type { Diagram, DiagramType } from "./DiagramCatalog";
import type { Shape } from "./DiagramTypes";

/**
 * Types of events in the diagram interaction lifecycle
 */
export type EventType = "Start" | "InProgress" | "End" | "Instant";

/**
 * Event fired when a pointer is pressed down on a diagram
 */
export type DiagramPointerEvent = {
	eventId: string;
	id: string;
};

/**
 * Event fired during diagram dragging operations
 */
export type DiagramDragEvent = {
	eventId: string;
	eventType: EventType;
	id: string;
	startX: number;
	startY: number;
	endX: number;
	endY: number;
	cursorX?: number;
	cursorY?: number;
};

/**
 * Event fired when a diagram is dragged and dropped onto another element
 */
export type DiagramDragDropEvent = {
	eventId: string;
	dropItem: {
		id: string;
		type?: DiagramType;
		x: number;
		y: number;
	};
	dropTargetItem: {
		id: string;
		type?: DiagramType;
		x: number;
		y: number;
	};
};

/**
 * Event fired when files are dropped onto a diagram
 */
export type FileDropEvent = {
	eventId: string;
	id: string;
	files: FileList;
};

/**
 * Event fired when a diagram is clicked
 */
export type DiagramClickEvent = {
	eventId: string;
	id: string;
};

/**
 * Event fired when hovering over a diagram
 */
export type DiagramHoverEvent = {
	eventId: string;
	id: string;
	isHovered: boolean;
};

/**
 * Event fired when a diagram is selected
 */
export type DiagramSelectEvent = {
	eventId: string;
	id: string;
	isMultiSelect?: boolean;
};

/**
 * Event fired during diagram transformation operations
 */
export type DiagramTransformEvent = {
	eventId: string;
	id: string;
	eventType: EventType;
	startShape: Shape;
	endShape: Shape;
	cursorX?: number;
	cursorY?: number;
};

/**
 * Data structure for diagram change events
 */
export type DiagramChangeData = Partial<Diagram>;

/**
 * The type of diagram change event.
 */
export type DiagramChangeEventType = "Drag" | "Transform" | "Appearance";

/**
 * Event fired when a diagram's properties are changed
 */
export type DiagramChangeEvent = {
	eventId: string;
	eventType: EventType;
	changeType: DiagramChangeEventType;
	id: string;
	startDiagram: DiagramChangeData;
	endDiagram: DiagramChangeData;
	cursorX?: number;
	cursorY?: number;
};

/**
 * Event fired when connecting two diagrams
 */
export type DiagramConnectEvent = {
	eventId: string;
	startOwnerId: string;
	points: PathPointData[];
	endOwnerId: string;
};

/**
 * Data structure for connection point movement
 *
 * @property id - ID of the moved connection point
 * @property name - Name of the connection point
 * @property x - Destination X coordinate
 * @property y - Destination Y coordinate
 * @property ownerId - ID of the owner of the connection point
 * @property ownerShape - Shape of the owner (used for redrawing connections; the shape of the
 *                       connection target's owner is retrieved within the connection line component)
 */
export type ConnectPointMoveData = {
	id: string;
	name: string;
	x: number;
	y: number;
	ownerId: string;
	ownerShape: Shape;
};

/**
 * Event fired when connection points are moved
 *
 * @property eventType - Type of the event
 * @property points - Data of the moved connection points
 */
export type ConnectPointsMoveEvent = {
	eventId: string;
	eventType: EventType;
	points: ConnectPointMoveData[];
};

/**
 * Event fired when text editing is initiated on a diagram
 */
export type DiagramTextEditEvent = {
	id: string;
};

/**
 * Event fired when text content is changed on a diagram
 */
export type DiagramTextChangeEvent = {
	eventId: string;
	id: string;
	text: string;
};

/**
 * Event name for SvgCanvas scroll.
 */
export const SVG_CANVAS_SCROLL_EVENT_NAME = "SvgCanvasScrollEvent" as const;

/**
 * Event type for SvgCanvas scroll.
 */
export type SvgCanvasScrollEvent = {
	scrollTop: number;
	scrollLeft: number;
};

/**
 * Event type for SvgCanvas resize.
 */
export type SvgCanvasResizeEvent = {
	minX: number;
	minY: number;
	width: number;
	height: number;
};

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

/**
 * Event for creating a new diagram item with complete details
 */
export type NewItemEvent = {
	eventId: string;
	item: Diagram;
};

/**
 * Types of stack order changes for diagrams
 */
export type StackOrderChangeType =
	| "bringToFront" // Move to the very front
	| "sendToBack" // Move to the very back
	| "bringForward" // Move one step forward
	| "sendBackward"; // Move one step backward

/**
 * Event for changing the z-index (stack order) of a diagram
 */
export type StackOrderChangeEvent = {
	id: string;
	changeType: StackOrderChangeType;
};

/**
 * Result data from an execution operation
 */
export type ExecuteResult = {
	text: string;
};

/**
 * Event fired when a diagram executes an operation
 */
export type ExecuteEvent = {
	eventId: string;
	eventType: EventType;
	id: string;
	data: ExecuteResult;
};

/**
 * Constant for the execution propagation event name
 */
export const EXECUTION_PROPAGATION_EVENT_NAME =
	"ExecutionPropagationEvent" as const;

/**
 * Event for propagating execution results between connected nodes
 */
export type ExecutionPropagationEvent = {
	eventId: string;
	eventType: EventType;
	id: string;
	targetId: string[];
	data: ExecuteResult;
};

/**
 * Event fired when connecting two nodes in a diagram
 */
export type ConnectNodesEvent = {
	eventId: string;
	sourceNodeId: string;
	targetNodeId: string;
};
