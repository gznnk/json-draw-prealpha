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
	LeftSide = "leftSide",
	RightSide = "rightSide",
	TopSide = "topSide",
	BottomSide = "bottomSide",
}

export type ArrangmentChangeStartEvent = {
	dragPointType: DragPointType;
};

export type ArrangmentChangeEvent = {
	arrangment: RectangleBaseArrangement;
};

export type ArrangmentChangeEndEvent = {
	dragPointType?: DragPointType;
	arrangment: RectangleBaseArrangement;
};

export type RectangleBaseDragPointProps = RectangleBaseArrangement & {
	draggingPointType?: DragPointType;
	dragEndPointType?: DragPointType;
	keepProportion: boolean;
	aspectRatio?: number;
	hidden?: boolean;
	onArrangmentChangeStart: (e: ArrangmentChangeStartEvent) => void;
	onArrangmentChange: (e: ArrangmentChangeEvent) => void;
	onArrangmentChangeEnd: (e: ArrangmentChangeEndEvent) => void;
};
