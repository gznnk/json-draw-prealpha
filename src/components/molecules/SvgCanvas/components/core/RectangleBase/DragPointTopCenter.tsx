// Reactのインポート
import { useRef, forwardRef, useImperativeHandle, useCallback } from "react";

// SvgCanvas関連型定義をインポート
import type { Point, DragEvent } from "../../../types";
import { DragDirection } from "../../../types";

// RectangleBase関連型定義をインポート
import type { RectangleBaseDragPointProps } from "./RectangleBaseTypes";
import { DragPointType } from "./RectangleBaseTypes";
// RectangleBase関連型コンポーネントをインポート
import RectangleBaseDragPointBase from "./RectangleBaseDragPointBase";

// RectangleBase関連関数をインポート
import {
	calcArrangment,
	createLinerDragY2xFunction,
} from "./RectangleBaseFunctions";

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

		const linerDragFunction = useCallback(
			(p: Point) =>
				createLinerDragY2xFunction(leftBottomPoint, topCenterPoint)(p),
			[leftBottomPoint, topCenterPoint],
		);

		return (
			<RectangleBaseDragPointBase
				point={topCenterPoint}
				dragPointType={DragPointType.TopCenter}
				direction={keepProportion ? DragDirection.All : DragDirection.Vertical}
				allowXDecimal
				cursor="n-resize"
				draggingPointType={draggingPointType}
				dragEndPointType={dragEndPointType}
				hidden={hidden}
				onArrangmentChangeStart={onArrangmentChangeStart}
				onArrangmentChange={onArrangmentChange}
				onArrangmentChangeEnd={onArrangmentChangeEnd}
				dragPositioningFunction={keepProportion ? linerDragFunction : undefined}
				calcArrangmentFunction={calcArrangmentFunction}
				ref={domRef}
			/>
		);
	},
);

export default DragPointTopCenter;
