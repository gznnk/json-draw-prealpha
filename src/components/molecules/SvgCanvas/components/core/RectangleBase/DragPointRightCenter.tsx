// Reactのインポート
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";

// SvgCanvas関連型定義をインポート
import type { Point } from "../../../types/CoordinateTypes";
import { DragDirection } from "../../../types/CoordinateTypes";
import type { DiagramDragEvent } from "../../../types/EventTypes";

// RectangleBase関連型定義をインポート
import type {
	RectangleBaseArrangement,
	RectangleBaseDragPointProps,
} from "./RectangleBaseTypes";
import { DragPointType } from "./RectangleBaseTypes";

// RectangleBase関連コンポーネントをインポート
import DragLine from "./DragLine";
import RectangleBaseDragPointBase from "./RectangleBaseDragPointBase";

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
			id,
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
			(e: DiagramDragEvent) => {
				if (keepProportion && aspectRatio) {
					const newWidth = e.endPoint.x - leftTopPoint.x;
					const newHeight = newWidth / aspectRatio;

					const newRightBottomPoint = {
						x: e.endPoint.x,
						y: leftTopPoint.y + newHeight,
					};

					return calcArrangment(leftTopPoint, newRightBottomPoint);
				}

				const newRightBottomPoint = {
					x: e.endPoint.x,
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
					id={id}
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
					id={id}
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
