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
	createLinerDragY2xFunction,
} from "./RectangleBaseFunctions";

// RectangleBase関連定数をインポート
import { DRAG_LINE_SPACE } from "./RectangleBaseConstants";

const DragPointTopCenter = forwardRef<SVGGElement, RectangleBaseDragPointProps>(
	(
		{
			id,
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
			(e: DiagramDragEvent) => {
				if (keepProportion && aspectRatio) {
					const newHeight = leftBottomPoint.y - e.endPoint.y;
					const newWidth = newHeight * aspectRatio;

					const newRightTopPoint = {
						x: leftBottomPoint.x + newWidth,
						y: e.endPoint.y,
					};

					return calcArrangment(leftBottomPoint, newRightTopPoint);
				}

				const newRightTopPoint = {
					x: rightTopPoint.x,
					y: e.endPoint.y,
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
					id={id}
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
					id={id}
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
