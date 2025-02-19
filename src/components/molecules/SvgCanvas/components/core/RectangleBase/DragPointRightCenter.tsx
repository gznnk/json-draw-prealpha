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

const DragPointRightCenter = forwardRef<
	SVGGElement,
	RectangleBaseDragPointProps
>(
	(
		{
			rightCenterPoint,
			leftTopPoint,
			rightBottomPoint,
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
			onArrangementChangeStart(DragPointType.RightCenter);
		}, [onArrangementChangeStart]);

		const calcArrangementWithCenterPoint = useCallback(
			(e: DragEvent) => {
				if (keepProportion && aspectRatio) {
					const newWidth = e.point.x - leftTopPoint.x;
					const newHeight = newWidth / aspectRatio;

					const newRightBottomPoint = {
						x: e.point.x,
						y: leftTopPoint.y + newHeight,
					};

					return calcArrangement(leftTopPoint, newRightBottomPoint);
				}

				const newRightBottomPoint = {
					x: e.point.x,
					y: rightBottomPoint.y,
				};

				return calcArrangement(leftTopPoint, newRightBottomPoint);
			},
			[leftTopPoint, rightBottomPoint.y, keepProportion, aspectRatio],
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
				createLinerDragX2yFunction(leftTopPoint, rightCenterPoint)(p),
			[leftTopPoint, rightCenterPoint],
		);

		if (draggingPoint && draggingPoint !== DragPointType.RightCenter) {
			return;
		}

		return (
			<DragPoint
				point={rightCenterPoint}
				direction={
					keepProportion ? DragDirection.All : DragDirection.Horizontal
				}
				allowYDecimal
				onDragStart={onDragStart}
				onDrag={onDrag}
				onDragEnd={onDragEnd}
				dragPositioningFunction={keepProportion ? linerDragFunction : undefined}
				cursor="e-resize"
				hidden={hidden}
				ref={domRef}
			/>
		);
	},
);

export default DragPointRightCenter;
