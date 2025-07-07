// Import types related to SvgCanvas.
import type { Point } from "../../../types/base/Point";
import type { Shape } from "../../../types/base/Shape";

/**
 * Connect point direction
 */
export type Direction = "up" | "down" | "left" | "right";

export type ConnectionEvent = {
	eventId: string;
	type: "connecting" | "connect" | "disconnect";
	startPointId: string;
	startX: number;
	startY: number;
	endPointId: string;
	endX: number;
	endY: number;
	endOwnerId: string;
	endOwnerShape: Shape;
};

export type ConnectingPoint = {
	id: string;
	x: number;
	y: number;
	onwerId: string;
	ownerShape: Shape;
};

export type GridPoint = Point & {
	score?: number;
};
