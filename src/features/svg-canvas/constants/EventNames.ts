/**
 * Centralized collection of all custom event names used throughout the svg-canvas feature.
 * This file provides a single source of truth for event naming to ensure consistency
 * and reduce the risk of typos or naming conflicts.
 */

// Diagram interaction events
export const EVENT_NAME_BROADCAST_DRAG = "BroadcastDrag" as const;

// Canvas events
export const EVENT_NAME_SVG_CANVAS_SCROLL = "SvgCanvasScroll" as const;

// Connection events
export const EVENT_NAME_CONNECT_POINTS_MOVE = "ConnectPointMove" as const;
export const EVENT_NAME_FLASH_CONNECT_LINE = "FlashConnectLine" as const;
export const EVENT_NAME_CONNECTTION = "Connection" as const;

// Execution chain events
export const EVENT_NAME_EXECUTION_PROPAGATION = "ExecutionPropagation" as const;

/**
 * Union type of all event names for type safety
 */
export type SvgCanvasEventNames =
	| typeof EVENT_NAME_BROADCAST_DRAG
	| typeof EVENT_NAME_SVG_CANVAS_SCROLL
	| typeof EVENT_NAME_CONNECT_POINTS_MOVE
	| typeof EVENT_NAME_FLASH_CONNECT_LINE
	| typeof EVENT_NAME_CONNECTTION
	| typeof EVENT_NAME_EXECUTION_PROPAGATION;
