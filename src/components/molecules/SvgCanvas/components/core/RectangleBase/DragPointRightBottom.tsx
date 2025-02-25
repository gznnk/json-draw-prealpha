// Reactのインポート
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";

// SvgCanvas関連型定義をインポート
import type { Point } from "../../../types/CoordinateTypes";
import type { DiagramDragEvent } from "../../../types/EventTypes";

// RectangleBase関連型定義をインポート
import type {
	RectangleBaseArrangement,
	RectangleBaseDragPointProps,
} from "./RectangleBaseTypes";
import { DragPointType } from "./RectangleBaseTypes";

// RectangleBase関連コンポーネントをインポート
import RectangleBaseDragPointBase from "./RectangleBaseDragPointBase";

// RectangleBase関連関数をインポート
import {
	calcArrangment,
	createLinerDragY2xFunction,
} from "./RectangleBaseFunctions";

const DragPointRightBottom = forwardRef<
	SVGGElement,
	RectangleBaseDragPointProps
>(
	(
		{
			id,
			rightBottomPoint,
			leftTopPoint,
			draggingPointType,
			dragEndPointType,
			keepProportion,
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
			(e: DiagramDragEvent) => calcArrangment(e.endPoint, leftTopPoint),
			[leftTopPoint],
		);

		const judgeNewDragPointType = useCallback(
			(newArrangement: RectangleBaseArrangement) => {
				const newRightBottomPoint = newArrangement.rightBottomPoint;
				if (leftTopPoint.x < newRightBottomPoint.x) {
					if (leftTopPoint.y < newRightBottomPoint.y) {
						return DragPointType.RightBottom;
					}
					return DragPointType.RightTop;
				}
				if (leftTopPoint.y < newRightBottomPoint.y) {
					return DragPointType.LeftBottom;
				}
				return DragPointType.LeftTop;
			},
			[leftTopPoint],
		);

		const linerDragFunction = useCallback(
			(p: Point) =>
				createLinerDragY2xFunction(rightBottomPoint, leftTopPoint)(p),
			[rightBottomPoint, leftTopPoint],
		);

		return (
			<RectangleBaseDragPointBase
				id={id}
				point={rightBottomPoint}
				dragPointType={DragPointType.RightBottom}
				cursor="se-resize"
				draggingPointType={draggingPointType}
				dragEndPointType={dragEndPointType}
				hidden={hidden}
				onArrangmentChangeStart={onArrangmentChangeStart}
				onArrangmentChange={onArrangmentChange}
				onArrangmentChangeEnd={onArrangmentChangeEnd}
				dragPositioningFunction={keepProportion ? linerDragFunction : undefined}
				calcArrangmentFunction={calcArrangmentFunction}
				judgeNewDragPointType={judgeNewDragPointType}
				ref={domRef}
			/>
		);
	},
);

export default DragPointRightBottom;
