// Reactのインポート
import { useRef, forwardRef, useImperativeHandle, useCallback } from "react";

// SvgCanvas関連型定義をインポート
import type { Point, DragEvent } from "../../../types";
import { DragDirection } from "../../../types";

// RectangleBase関連型定義をインポート
import type {
	RectangleBaseDragPointProps,
	RectangleBaseArrangement,
} from "./RectangleBaseTypes";
import { DragPointType } from "./RectangleBaseTypes";
// RectangleBase関連コンポーネントをインポート
import RectangleBaseDragPointBase from "./RectangleBaseDragPointBase";
import DragLine from "./DragLine";

// RectangleBase関連関数をインポート
import {
	calcArrangment,
	createLinerDragY2xFunction,
} from "./RectangleBaseFunctions";
// RectangleBase関連定数をインポート
import { DRAG_LINE_SPACE } from "./RectangleBaseConstants";

const DragPointTopCenter = forwardRef<SVGGElement, RectangleBaseDragPointProps>(
	(
		{
			topCenterPoint,
			leftBottomPoint,
			rightTopPoint,
			draggingPointType,
			dragEndPointType,
			keepProportion,
			aspectRatio,
			hidden,
			onArrangmentChangeStart,
			onArrangmentChange,
			onArrangmentChangeEnd,
		},
		ref,
	) => {
		const domRef = useRef<SVGGElement>({} as SVGGElement);
		useImperativeHandle(ref, () => domRef.current);

		const calcArrangmentFunction = useCallback(
			(e: DragEvent) => {
				if (keepProportion && aspectRatio) {
					const newHeight = leftBottomPoint.y - e.point.y;
					const newWidth = newHeight * aspectRatio;

					const newRightTopPoint = {
						x: leftBottomPoint.x + newWidth,
						y: e.point.y,
					};

					return calcArrangment(leftBottomPoint, newRightTopPoint);
				}

				const newRightTopPoint = {
					x: rightTopPoint.x,
					y: e.point.y,
				};

				return calcArrangment(leftBottomPoint, newRightTopPoint);
			},
			[leftBottomPoint, rightTopPoint.x, keepProportion, aspectRatio],
		);

		const judgeNewDragPointType = useCallback(
			(newArrangement: RectangleBaseArrangement) => {
				const newTopCenterPoint = newArrangement.topCenterPoint;
				if (newTopCenterPoint.y < leftBottomPoint.y) {
					return DragPointType.TopCenter;
				}
				return DragPointType.BottomCenter;
			},
			[leftBottomPoint],
		);

		const linerDragFunction = useCallback(
			(p: Point) =>
				createLinerDragY2xFunction(leftBottomPoint, topCenterPoint)(p),
			[leftBottomPoint, topCenterPoint],
		);

		return (
			<>
				<DragLine
					startPoint={{
						x: leftBottomPoint.x + DRAG_LINE_SPACE,
						y: topCenterPoint.y,
					}}
					endPoint={{
						x: rightTopPoint.x - DRAG_LINE_SPACE,
						y: topCenterPoint.y,
					}}
					dragPointType={DragPointType.TopSide}
					direction={DragDirection.Vertical}
					cursor="n-resize"
					onArrangmentChangeStart={onArrangmentChangeStart}
					onArrangmentChange={onArrangmentChange}
					onArrangmentChangeEnd={onArrangmentChangeEnd}
					calcArrangmentFunction={calcArrangmentFunction}
				/>
				<RectangleBaseDragPointBase
					point={topCenterPoint}
					dragPointType={DragPointType.TopCenter}
					direction={
						keepProportion ? DragDirection.All : DragDirection.Vertical
					}
					allowXDecimal
					cursor="n-resize"
					draggingPointType={draggingPointType}
					dragEndPointType={dragEndPointType}
					hidden={hidden}
					onArrangmentChangeStart={onArrangmentChangeStart}
					onArrangmentChange={onArrangmentChange}
					onArrangmentChangeEnd={onArrangmentChangeEnd}
					dragPositioningFunction={
						keepProportion ? linerDragFunction : undefined
					}
					calcArrangmentFunction={calcArrangmentFunction}
					judgeNewDragPointType={judgeNewDragPointType}
					ref={domRef}
				/>
			</>
		);
	},
);

export default DragPointTopCenter;
