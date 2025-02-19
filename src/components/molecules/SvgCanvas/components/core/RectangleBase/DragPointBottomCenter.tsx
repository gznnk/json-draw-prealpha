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
	createLinerDragY2xFunction,
} from "./RectangleBaseFunctions";

const DragPointBottomCenter = forwardRef<
	SVGGElement,
	RectangleBaseDragPointProps
>(
	(
		{
			bottomCenterPoint,
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
			onArrangementChangeStart(DragPointType.BottomCenter);
		}, [onArrangementChangeStart]);

		const calcArrangementWithCenterPoint = useCallback(
			(e: DragEvent) => {
				if (keepProportion && aspectRatio) {
					const newHeight = e.point.y - leftTopPoint.y;
					const newWidth = newHeight * aspectRatio;

					const newRightBottomPoint = {
						x: leftTopPoint.x + newWidth,
						y: e.point.y,
					};

					return calcArrangement(leftTopPoint, newRightBottomPoint);
				}

				const newRightBottomPoint = {
					x: rightBottomPoint.x,
					y: e.point.y,
				};

				return calcArrangement(leftTopPoint, newRightBottomPoint);
			},
			[leftTopPoint, rightBottomPoint.x, keepProportion, aspectRatio],
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
				createLinerDragY2xFunction(leftTopPoint, bottomCenterPoint)(p),
			[leftTopPoint, bottomCenterPoint],
		);

		if (draggingPoint && draggingPoint !== DragPointType.BottomCenter) {
			return;
		}

		return (
			<DragPoint
				point={bottomCenterPoint}
				direction={keepProportion ? DragDirection.All : DragDirection.Vertical}
				allowXDecimal
				onDragStart={onDragStart}
				onDrag={onDrag}
				onDragEnd={onDragEnd}
				dragPositioningFunction={keepProportion ? linerDragFunction : undefined}
				cursor="s-resize"
				hidden={hidden}
				ref={domRef}
			/>
		);
	},
);

export default DragPointBottomCenter;
