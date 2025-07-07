// Import types related to SvgCanvas.
import type { Shape } from "../../../types/base/Shape";

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
