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

const DragPointBottomCenter = forwardRef<
	SVGGElement,
	RectangleBaseDragPointProps
>(
	(
		{
			bottomCenterPoint,
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
					const newHeight = e.point.y - leftTopPoint.y;
					const newWidth = newHeight * aspectRatio;

					const newRightBottomPoint = {
						x: leftTopPoint.x + newWidth,
						y: e.point.y,
					};

					return calcArrangment(leftTopPoint, newRightBottomPoint);
				}

				const newRightBottomPoint = {
					x: rightBottomPoint.x,
					y: e.point.y,
				};

				return calcArrangment(leftTopPoint, newRightBottomPoint);
			},
			[leftTopPoint, rightBottomPoint.x, keepProportion, aspectRatio],
		);

		const judgeNewDragPointType = useCallback(
			(newArrangement: RectangleBaseArrangement) => {
				const newBottomCenterPoint = newArrangement.bottomCenterPoint;
				if (leftTopPoint.y < newBottomCenterPoint.y) {
					return DragPointType.BottomCenter;
				}
				return DragPointType.TopCenter;
			},
			[leftTopPoint],
		);

		const linerDragFunction = useCallback(
			(p: Point) =>
				createLinerDragY2xFunction(leftTopPoint, bottomCenterPoint)(p),
			[leftTopPoint, bottomCenterPoint],
		);

		return (
			<>
				<DragLine
					startPoint={{
						x: leftTopPoint.x + DRAG_LINE_SPACE,
						y: bottomCenterPoint.y,
					}}
					endPoint={{
						x: rightBottomPoint.x - DRAG_LINE_SPACE,
						y: bottomCenterPoint.y,
					}}
					dragPointType={DragPointType.BottomSide}
					direction={DragDirection.Vertical}
					cursor="s-resize"
					onArrangmentChangeStart={onArrangmentChangeStart}
					onArrangmentChange={onArrangmentChange}
					onArrangmentChangeEnd={onArrangmentChangeEnd}
					calcArrangmentFunction={calcArrangmentFunction}
				/>
				<RectangleBaseDragPointBase
					point={bottomCenterPoint}
					dragPointType={DragPointType.BottomCenter}
					direction={
						keepProportion ? DragDirection.All : DragDirection.Vertical
					}
					allowXDecimal
					cursor="s-resize"
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

export default DragPointBottomCenter;
