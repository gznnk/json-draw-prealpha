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
	createLinerDragX2yFunction,
} from "./RectangleBaseFunctions";
// RectangleBase関連定数をインポート
import { DRAG_LINE_SPACE } from "./RectangleBaseConstants";

const DragPointRightCenter = forwardRef<
	SVGGElement,
	RectangleBaseDragPointProps
>(
	(
		{
			rightCenterPoint,
			leftTopPoint,
			rightBottomPoint,
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
					const newWidth = e.point.x - leftTopPoint.x;
					const newHeight = newWidth / aspectRatio;

					const newRightBottomPoint = {
						x: e.point.x,
						y: leftTopPoint.y + newHeight,
					};

					return calcArrangment(leftTopPoint, newRightBottomPoint);
				}

				const newRightBottomPoint = {
					x: e.point.x,
					y: rightBottomPoint.y,
				};

				return calcArrangment(leftTopPoint, newRightBottomPoint);
			},
			[leftTopPoint, rightBottomPoint.y, keepProportion, aspectRatio],
		);

		const judgeNewDragPointType = useCallback(
			(newArrangement: RectangleBaseArrangement) => {
				const newRightCenterPoint = newArrangement.rightCenterPoint;
				if (leftTopPoint.x < newRightCenterPoint.x) {
					return DragPointType.RightCenter;
				}
				return DragPointType.LeftCenter;
			},
			[leftTopPoint],
		);

		const linerDragFunction = useCallback(
			(p: Point) =>
				createLinerDragX2yFunction(leftTopPoint, rightCenterPoint)(p),
			[leftTopPoint, rightCenterPoint],
		);

		return (
			<>
				<DragLine
					startPoint={{
						x: rightCenterPoint.x,
						y: leftTopPoint.y + DRAG_LINE_SPACE,
					}}
					endPoint={{
						x: rightCenterPoint.x,
						y: rightBottomPoint.y - DRAG_LINE_SPACE,
					}}
					dragPointType={DragPointType.RightSide}
					direction={DragDirection.Horizontal}
					cursor="e-resize"
					onArrangmentChangeStart={onArrangmentChangeStart}
					onArrangmentChange={onArrangmentChange}
					onArrangmentChangeEnd={onArrangmentChangeEnd}
					calcArrangmentFunction={calcArrangmentFunction}
				/>
				<RectangleBaseDragPointBase
					point={rightCenterPoint}
					dragPointType={DragPointType.RightCenter}
					direction={
						keepProportion ? DragDirection.All : DragDirection.Horizontal
					}
					allowYDecimal
					cursor="e-resize"
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

export default DragPointRightCenter;
