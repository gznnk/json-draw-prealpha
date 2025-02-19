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

const DragPointTopCenter = forwardRef<SVGGElement, RectangleBaseDragPointProps>(
	(
		{
			topCenterPoint,
			leftBottomPoint,
			rightTopPoint,
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
			onArrangementChangeStart(DragPointType.TopCenter);
		}, [onArrangementChangeStart]);

		const calcArrangementWithCenterPoint = useCallback(
			(e: DragEvent) => {
				if (keepProportion && aspectRatio) {
					const newHeight = leftBottomPoint.y - e.point.y;
					const newWidth = newHeight * aspectRatio;

					const newRightTopPoint = {
						x: leftBottomPoint.x + newWidth,
						y: e.point.y,
					};

					return calcArrangement(leftBottomPoint, newRightTopPoint);
				}

				const newRightTopPoint = {
					x: rightTopPoint.x,
					y: e.point.y,
				};

				return calcArrangement(leftBottomPoint, newRightTopPoint);
			},
			[leftBottomPoint, rightTopPoint.x, keepProportion, aspectRatio],
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
				createLinerDragY2xFunction(leftBottomPoint, topCenterPoint)(p),
			[leftBottomPoint, topCenterPoint],
		);

		if (draggingPoint && draggingPoint !== DragPointType.TopCenter) {
			return;
		}

		return (
			<DragPoint
				point={topCenterPoint}
				direction={keepProportion ? DragDirection.All : DragDirection.Vertical}
				allowXDecimal
				onDragStart={onDragStart}
				onDrag={onDrag}
				onDragEnd={onDragEnd}
				dragPositioningFunction={keepProportion ? linerDragFunction : undefined}
				cursor="n-resize"
				hidden={hidden}
				ref={domRef}
			/>
		);
	},
);

export default DragPointTopCenter;
