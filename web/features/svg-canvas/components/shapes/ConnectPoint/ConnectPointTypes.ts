import type { Frame } from "../../../types/core/Frame";

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
	endOwnerFrame: Frame;
};

export type ConnectingPoint = {
	id: string;
	x: number;
	y: number;
	onwerId: string;
	ownerFrame: Frame;
};
