// RectangleBase関連型定義ファイル

import type { Point } from "../../../types";

export type RectangleBaseArrangement = {
	point: Point;
	width: number;
	height: number;
	aspectRatio?: number;
	leftTopPoint: Point;
	leftBottomPoint: Point;
	rightTopPoint: Point;
	rightBottomPoint: Point;
	topCenterPoint: Point;
	leftCenterPoint: Point;
	rightCenterPoint: Point;
	bottomCenterPoint: Point;
};

export type RectangleBaseState = Required<RectangleBaseArrangement> & {
	id?: string;
	isDragging: boolean;
	draggingPoint?: DragPointType;
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

export type RectangleBaseDragPointProps = RectangleBaseState & {
	keepProportion: boolean;
	hidden?: boolean;
	onArrangementChangeStart: (dragPointType: DragPointType) => void;
	onArrangementChange: (arrangement: RectangleBaseArrangement) => void;
	onArrangementChangeEnd: (arrangement: RectangleBaseArrangement) => void;
};
