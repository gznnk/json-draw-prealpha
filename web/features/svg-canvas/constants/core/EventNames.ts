/**
 * Centralized collection of all custom event names used throughout the svg-canvas feature.
 * This file provides a single source of truth for event naming to ensure consistency
 * and reduce the risk of typos or naming conflicts.
 */

// Diagram interaction events
export const EVENT_NAME_BROADCAST_DRAG = "BroadcastDrag" as const;

// Canvas events
export const EVENT_NAME_SVG_CANVAS_SCROLL = "SvgCanvasScroll" as const;

// Tool events
export const ADD_NEW_DIAGRAM_EVENT_NAME = "AddNewDiagram" as const;

// Connection events
export const EVENT_NAME_FLASH_CONNECT_LINE = "FlashConnectLine" as const;
export const EVENT_NAME_CONNECTION = "Connection" as const;
export const EVENT_NAME_CONNECT_NODES = "ConnectNodes" as const;

// Group events
export const EVENT_NAME_GROUP_SHAPES = "GroupShapes" as const;

// Execution chain events
export const EVENT_NAME_EXECUTION_PROPAGATION = "ExecutionPropagation" as const;

/**
 * Union type of all event names for type safety
 */
export type SvgCanvasEventNames =
	| typeof EVENT_NAME_BROADCAST_DRAG
	| typeof EVENT_NAME_SVG_CANVAS_SCROLL
	| typeof EVENT_NAME_FLASH_CONNECT_LINE
	| typeof EVENT_NAME_CONNECTION
	| typeof EVENT_NAME_CONNECT_NODES
	| typeof EVENT_NAME_GROUP_SHAPES
	| typeof EVENT_NAME_EXECUTION_PROPAGATION;
