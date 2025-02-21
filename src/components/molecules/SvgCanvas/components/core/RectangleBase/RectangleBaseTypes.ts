// RectangleBase関連型定義ファイル

import type { Point } from "../../../types";

export type RectangleBaseArrangement = {
	point: Point;
	width: number;
	height: number;
	leftTopPoint: Point;
	leftBottomPoint: Point;
	rightTopPoint: Point;
	rightBottomPoint: Point;
	topCenterPoint: Point;
	leftCenterPoint: Point;
	rightCenterPoint: Point;
	bottomCenterPoint: Point;
};

export type RectangleBaseState = RectangleBaseArrangement & {
	id?: string;
	aspectRatio: number;
	isDragging: boolean;
	draggingPointType?: DragPointType;
	dragEndPointType?: DragPointType;
};

export enum DragPointType {
	LeftTop = "leftTop",
	LeftBottom = "leftBottom",
	RightTop = "rightTop",
	RightBottom = "rightBottom",
	TopCenter = "topCenter",
	LeftCenter = "leftCenter",
	RightCenter = "rightCenter",
	BottomCenter = "bottomCenter",
}

export type RectangleBaseDragPointProps = RectangleBaseArrangement & {
	draggingPointType?: DragPointType;
	dragEndPointType?: DragPointType;
	keepProportion: boolean;
	aspectRatio?: number;
	hidden?: boolean;
	onArrangmentChangeStart: (e: { dragPointType: DragPointType }) => void;
	onArrangmentChange: (e: { arrangment: RectangleBaseArrangement }) => void;
	onArrangmentChangeEnd: (e: {
		dragPointType: DragPointType;
		arrangment: RectangleBaseArrangement;
	}) => void;
};
