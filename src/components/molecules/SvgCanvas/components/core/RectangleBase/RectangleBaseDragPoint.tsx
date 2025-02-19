// Reactのインポート
import { useRef, forwardRef, useImperativeHandle, useCallback } from "react";

// SvgCanvas関連型定義をインポート
import type { Point, DragEvent, DragDirection } from "../../../types";
import { DragFunctionType } from "../../../types";
// SvgCanvasコンポーネントをインポート
import DragPoint from "../DragPoint";

// RectangleBase関連型定義をインポート
// import type { RectangleBaseDragPointProps } from "./RectangleBaseTypes";
import type { RectangleBaseArrangement } from "./RectangleBaseTypes";
import type { DragPointType } from "./RectangleBaseTypes";

// RectangleBase関連関数をインポート
import {
	calcArrangement,
	createLinerDragY2xFunction,
	createLinerDragX2yFunction,
} from "./RectangleBaseFunctions";

/**
 * RectangleBaseDragPointコンポーネントのPropsの型定義
 */
type RectangleBaseDragPointProps = {
	dragPointType: DragPointType; // ドラッグ点の種類
	direction?: DragDirection; // ドラッグの方向
	dragFunctionType?: DragFunctionType; // ドラッグ関数の種類
	dragPoint: Point; // ドラッグ点の座標
	scaleOriginPoint: Point; // 拡縮の起点
	scaleDiagonalPoint?: Point; // 拡縮の起点の対角点（辺の中央のドラッグ点の場合に指定）
	isDragging: boolean; // 親のRectangleBaseコンポーネントに所属するドラッグ点がドラッグ中かどうか
	draggingPoint?: DragPointType; // ドラッグ中のドラッグ点の種類
	keepProportion: boolean; // 拡縮時にアスペクト比を保つかどうか
	aspectRatio: number; // アスペクト比
	cursor: string; // ドラッグ時のカーソル
	hidden?: boolean; // 非表示かどうか
	onArrangementChangeStart: (dragPointType: DragPointType) => void; // ドラッグ開始時のコールバック
	onArrangementChange: (arrangement: RectangleBaseArrangement) => void; // ドラッグ中のコールバック
	onArrangementChangeEnd: (arrangement: RectangleBaseArrangement) => void; // ドラッグ終了時のコールバック
};

const RectangleBaseDragPoint = forwardRef<
	SVGGElement,
	RectangleBaseDragPointProps
>(
	(
		{
			dragPointType,
			direction,
			dragFunctionType = DragFunctionType.LinerY2x,
			dragPoint,
			scaleOriginPoint,
			scaleDiagonalPoint,
			isDragging,
			draggingPoint,
			keepProportion = false,
			aspectRatio,
			cursor,
			hidden = false,
			onArrangementChangeStart,
			onArrangementChange,
			onArrangementChangeEnd,
		},
		ref,
	) => {
		const domRef = useRef<SVGGElement>({} as SVGGElement);
		useImperativeHandle(ref, () => domRef.current);

		const onDragStart = useCallback(() => {
			onArrangementChangeStart(dragPointType);
		}, [onArrangementChangeStart, dragPointType]);

		const getScalePoint = useCallback(
			(e: DragEvent) => {
				if (scaleDiagonalPoint) {
					if (dragFunctionType === DragFunctionType.LinerY2x) {
						if (keepProportion) {
							const newHeight = scaleOriginPoint.y - e.point.y;
							const newWidth = newHeight * aspectRatio;

							return {
								x: scaleOriginPoint.x + newWidth,
								y: e.point.y,
							};
						}

						return {
							x: scaleDiagonalPoint.x,
							y: e.point.y,
						};
					}

					if (keepProportion) {
						const newWidth = scaleOriginPoint.x - e.point.x;
						const newHeight = newWidth / aspectRatio;

						return {
							x: e.point.x,
							y: scaleOriginPoint.y - newHeight,
						};
					}

					return {
						x: e.point.x,
						y: scaleDiagonalPoint.y,
					};
				}

				return e.point;
			},
			[
				dragFunctionType,
				scaleOriginPoint,
				scaleDiagonalPoint,
				keepProportion,
				aspectRatio,
			],
		);

		const onDrag = useCallback(
			(e: DragEvent) => {
				const newArrangment = calcArrangement(
					getScalePoint(e),
					scaleOriginPoint,
					keepProportion,
				);

				onArrangementChange(newArrangment);
			},
			[getScalePoint, onArrangementChange, scaleOriginPoint, keepProportion],
		);

		const onDragEnd = useCallback(
			(e: DragEvent) => {
				const newArrangment = calcArrangement(
					getScalePoint(e),
					scaleOriginPoint,
					keepProportion,
				);

				onArrangementChangeEnd(newArrangment);
			},
			[getScalePoint, onArrangementChangeEnd, scaleOriginPoint, keepProportion],
		);

		const linerDragFunction = useCallback(
			(p: Point) =>
				dragFunctionType === DragFunctionType.LinerY2x
					? createLinerDragY2xFunction(scaleOriginPoint, dragPoint)(p)
					: createLinerDragX2yFunction(scaleOriginPoint, dragPoint)(p),
			[dragFunctionType, dragPoint, scaleOriginPoint],
		);

		if (isDragging && draggingPoint !== dragPointType) {
			return;
		}

		return (
			<DragPoint
				point={dragPoint}
				direction={direction}
				onDragStart={onDragStart}
				onDrag={onDrag}
				onDragEnd={onDragEnd}
				dragPositioningFunction={keepProportion ? linerDragFunction : undefined}
				cursor={cursor}
				hidden={hidden}
				ref={domRef}
			/>
		);
	},
);

export default RectangleBaseDragPoint;
