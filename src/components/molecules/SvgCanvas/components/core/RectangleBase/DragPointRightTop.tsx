// Reactのインポート
import { useRef, forwardRef, useImperativeHandle, useCallback } from "react";

// SvgCanvas関連型定義をインポート
import type { Point, DragEvent } from "../../../types";

// RectangleBase関連型定義をインポート
import type {
	RectangleBaseDragPointProps,
	RectangleBaseArrangement,
} from "./RectangleBaseTypes";
import { DragPointType } from "./RectangleBaseTypes";
// RectangleBase関連コンポーネントをインポート
import RectangleBaseDragPointBase from "./RectangleBaseDragPointBase";

// RectangleBase関連関数をインポート
import {
	calcArrangment,
	createLinerDragY2xFunction,
} from "./RectangleBaseFunctions";

const DragPointRightTop = forwardRef<SVGGElement, RectangleBaseDragPointProps>(
	(
		{
			rightTopPoint,
			leftBottomPoint,
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
			(e: DragEvent) => calcArrangment(e.point, leftBottomPoint),
			[leftBottomPoint],
		);

		const judgeNewDragPointType = useCallback(
			(newArrangement: RectangleBaseArrangement) => {
				const newRightTopPoint = newArrangement.rightTopPoint;
				if (leftBottomPoint.x < newRightTopPoint.x) {
					if (newRightTopPoint.y < leftBottomPoint.y) {
						return DragPointType.RightTop;
					}
					return DragPointType.RightBottom;
				}
				if (newRightTopPoint.y < leftBottomPoint.y) {
					return DragPointType.LeftTop;
				}
				return DragPointType.LeftBottom;
			},
			[leftBottomPoint],
		);

		const linerDragFunction = useCallback(
			(p: Point) =>
				createLinerDragY2xFunction(rightTopPoint, leftBottomPoint)(p),
			[rightTopPoint, leftBottomPoint],
		);

		return (
			<RectangleBaseDragPointBase
				point={rightTopPoint}
				dragPointType={DragPointType.RightTop}
				cursor="ne-resize"
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

export default DragPointRightTop;
