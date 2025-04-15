// Import types related to SvgCanvas.
import type { Point } from "../../../types/CoordinateTypes";
import type { DiagramBaseData, Shape } from "../../../types/DiagramTypes";

/**
 * 接続ポイントのデータ
 */
export type ConnectPointData = DiagramBaseData & {
	name: string;
};

/**
 * 接続ポイントの方向
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
