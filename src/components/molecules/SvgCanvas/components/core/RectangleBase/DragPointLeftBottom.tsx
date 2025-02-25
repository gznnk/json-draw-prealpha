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

const DragPointLeftTop = forwardRef<SVGGElement, RectangleBaseDragPointProps>(
	(
		{
			id,
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
			(e: DiagramDragEvent) => calcArrangment(e.endPoint, rightTopPoint),
			[rightTopPoint],
		);

		const judgeNewDragPointType = useCallback(
			(newArrangement: RectangleBaseArrangement) => {
				const newLeftBottomPoint = newArrangement.leftBottomPoint;
				if (newLeftBottomPoint.x < rightTopPoint.x) {
					if (rightTopPoint.y < newLeftBottomPoint.y) {
						return DragPointType.LeftBottom;
					}
					return DragPointType.LeftTop;
				}
				if (rightTopPoint.y < newLeftBottomPoint.y) {
					return DragPointType.RightBottom;
				}
				return DragPointType.RightTop;
			},
			[rightTopPoint],
		);

		const linerDragFunction = useCallback(
			(p: Point) =>
				createLinerDragY2xFunction(rightTopPoint, leftBottomPoint)(p),
			[rightTopPoint, leftBottomPoint],
		);

		return (
			<RectangleBaseDragPointBase
				id={id}
				point={leftBottomPoint}
				dragPointType={DragPointType.LeftBottom}
				cursor="sw-resize"
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

export default DragPointLeftTop;
