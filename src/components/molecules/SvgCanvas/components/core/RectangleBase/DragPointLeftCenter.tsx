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

const DragPointLeftCenter = forwardRef<
	SVGGElement,
	RectangleBaseDragPointProps
>(
	(
		{
			leftCenterPoint,
			rightTopPoint,
			leftBottomPoint,
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
					const newWidth = rightTopPoint.x - e.point.x;
					const newHeight = newWidth / aspectRatio;

					const newLeftBottomPoint = {
						x: e.point.x,
						y: rightTopPoint.y + newHeight,
					};

					return calcArrangment(rightTopPoint, newLeftBottomPoint);
				}

				const newLeftBottomPoint = {
					x: e.point.x,
					y: leftBottomPoint.y,
				};

				return calcArrangment(rightTopPoint, newLeftBottomPoint);
			},
			[rightTopPoint, leftBottomPoint, keepProportion, aspectRatio],
		);

		const judgeNewDragPointType = useCallback(
			(newArrangement: RectangleBaseArrangement) => {
				const newLeftCenterPoint = newArrangement.leftCenterPoint;
				if (newLeftCenterPoint.x < rightTopPoint.x) {
					return DragPointType.LeftCenter;
				}
				return DragPointType.RightCenter;
			},
			[rightTopPoint],
		);

		const linerDragFunction = useCallback(
			(p: Point) =>
				createLinerDragX2yFunction(rightTopPoint, leftCenterPoint)(p),
			[rightTopPoint, leftCenterPoint],
		);

		return (
			<>
				<DragLine
					startPoint={{
						x: leftCenterPoint.x,
						y: rightTopPoint.y + DRAG_LINE_SPACE,
					}}
					endPoint={{
						x: leftCenterPoint.x,
						y: leftBottomPoint.y - DRAG_LINE_SPACE,
					}}
					dragPointType={DragPointType.LeftSide}
					direction={DragDirection.Horizontal}
					cursor="w-resize"
					onArrangmentChangeStart={onArrangmentChangeStart}
					onArrangmentChange={onArrangmentChange}
					onArrangmentChangeEnd={onArrangmentChangeEnd}
					calcArrangmentFunction={calcArrangmentFunction}
				/>
				<RectangleBaseDragPointBase
					point={leftCenterPoint}
					dragPointType={DragPointType.LeftCenter}
					direction={
						keepProportion ? DragDirection.All : DragDirection.Horizontal
					}
					allowYDecimal
					cursor="w-resize"
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

export default DragPointLeftCenter;
