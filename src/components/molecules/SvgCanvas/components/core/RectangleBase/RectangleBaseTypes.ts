// RectangleBase関連型定義ファイル

// SvgCanvas関連型定義をインポート
import type { Point } from "../../../types/CoordinateTypes";

/**
 * 矩形のドラッグポイントの位置
 */
export type RectangleBaseDragPoints = {
	leftTopPoint: Point;
	leftBottomPoint: Point;
	rightTopPoint: Point;
	rightBottomPoint: Point;
	topCenterPoint: Point;
	leftCenterPoint: Point;
	rightCenterPoint: Point;
	bottomCenterPoint: Point;
};

/**
 * 矩形の配置情報
 */
export type RectangleBaseArrangement = RectangleBaseDragPoints & {
	point: Point;
	width: number;
	height: number;
};

/**
 * 矩形の基底コンポーネントのドラッグポイントの種類
 */
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

/**
 * 矩形の基底コンポーネントのState型定義
 */
export type RectangleBaseState = RectangleBaseArrangement & {
	aspectRatio: number;
	isDragging: boolean;
	draggingPointType?: DragPointType;
	dragEndPointType?: DragPointType;
};

/**
 * 矩形の配置情報更新開始イベント型定義
 *
 * @property {DragPointType} dragPointType - ドラッグ開始時のドラッグポイントの種類
 */
export type ArrangmentChangeStartEvent = {
	dragPointType: DragPointType;
};

/**
 * 矩形の配置情報更新中イベント型定義
 *
 * @property {RectangleBaseArrangement} arrangment - 更新中の矩形の配置情報
 */
export type ArrangmentChangeEvent = {
	arrangment: RectangleBaseArrangement;
};

/**
 * 矩形の配置情報更新終了イベント型定義
 *
 * @property {DragPointType} dragPointType - ドラッグ終了時のドラッグポイントの種類
 * @property {RectangleBaseArrangement} arrangment - 更新後の矩形の配置情報
 */
export type ArrangmentChangeEndEvent = {
	dragPointType?: DragPointType;
	arrangment: RectangleBaseArrangement;
};

/**
 * 矩形の基底コンポーネントのドラッグポイントのProps型定義
 */
export type RectangleBaseDragPointProps = RectangleBaseArrangement & {
	id: string;
	draggingPointType?: DragPointType;
	dragEndPointType?: DragPointType;
	keepProportion: boolean;
	aspectRatio?: number;
	hidden?: boolean;
	isSelected?: boolean;
	onArrangmentChangeStart: (e: ArrangmentChangeStartEvent) => void;
	onArrangmentChange: (e: ArrangmentChangeEvent) => void;
	onArrangmentChangeEnd: (e: ArrangmentChangeEndEvent) => void;
};
