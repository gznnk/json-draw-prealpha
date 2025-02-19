// Reactのインポート
import { useRef, forwardRef, useImperativeHandle, useCallback } from "react";

// SvgCanvas関連型定義をインポート
import type { Point, DragEvent } from "../../../types";
import { DragDirection } from "../../../types";
// SvgCanvasコンポーネントをインポート
import DragPoint from "../DragPoint";

// RectangleBase関連型定義をインポート
import type { RectangleBaseDragPointProps } from "./RectangleBaseTypes";
import { DragPointType } from "./RectangleBaseTypes";

// RectangleBase関連関数をインポート
import {
	calcArrangement,
	createLinerDragX2yFunction,
} from "./RectangleBaseFunctions";

const DragPointLeftCenter = forwardRef<
	SVGGElement,
	RectangleBaseDragPointProps
>(
	(
		{
			leftCenterPoint,
			rightTopPoint,
			leftBottomPoint,
			draggingPoint,
			keepProportion = false,
			aspectRatio,
			hidden = false,
			onArrangementChangeStart,
			onArrangementChange,
			onArrangementChangeEnd,
		},
		ref,
	) => {
		const domRef = useRef<SVGGElement>({} as SVGGElement);
		useImperativeHandle(ref, () => domRef.current);

		const onDragStart = useCallback(() => {
			onArrangementChangeStart(DragPointType.LeftCenter);
		}, [onArrangementChangeStart]);

		const calcArrangementWithCenterPoint = useCallback(
			(e: DragEvent) => {
				if (keepProportion && aspectRatio) {
					const newWidth = rightTopPoint.x - e.point.x;
					const newHeight = newWidth / aspectRatio;

					const newLeftBottomPoint = {
						x: e.point.x,
						y: rightTopPoint.y + newHeight,
					};

					return calcArrangement(rightTopPoint, newLeftBottomPoint);
				}

				const newLeftBottomPoint = {
					x: e.point.x,
					y: leftBottomPoint.y,
				};

				return calcArrangement(rightTopPoint, newLeftBottomPoint);
			},
			[rightTopPoint, leftBottomPoint, keepProportion, aspectRatio],
		);

		const onDrag = useCallback(
			(e: DragEvent) => {
				const newArrangment = calcArrangementWithCenterPoint(e);

				onArrangementChange(newArrangment);
			},
			[onArrangementChange, calcArrangementWithCenterPoint],
		);

		const onDragEnd = useCallback(
			(e: DragEvent) => {
				const newArrangment = calcArrangementWithCenterPoint(e);

				onArrangementChangeEnd(newArrangment);
			},
			[onArrangementChangeEnd, calcArrangementWithCenterPoint],
		);

		const linerDragFunction = useCallback(
			(p: Point) =>
				createLinerDragX2yFunction(rightTopPoint, leftCenterPoint)(p),
			[rightTopPoint, leftCenterPoint],
		);

		if (draggingPoint && draggingPoint !== DragPointType.LeftCenter) {
			return;
		}

		return (
			<DragPoint
				point={leftCenterPoint}
				direction={
					keepProportion ? DragDirection.All : DragDirection.Horizontal
				}
				allowYDecimal
				onDragStart={onDragStart}
				onDrag={onDrag}
				onDragEnd={onDragEnd}
				dragPositioningFunction={keepProportion ? linerDragFunction : undefined}
				cursor="w-resize"
				hidden={hidden}
				ref={domRef}
			/>
		);
	},
);

export default DragPointLeftCenter;
