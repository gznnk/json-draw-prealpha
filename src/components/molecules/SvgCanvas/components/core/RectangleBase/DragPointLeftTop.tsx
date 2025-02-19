// Reactのインポート
import { useRef, forwardRef, useImperativeHandle, useCallback } from "react";

// SvgCanvas関連型定義をインポート
import type { Point, DragEvent } from "../../../types";
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

const DragPointLeftTop = forwardRef<SVGGElement, RectangleBaseDragPointProps>(
	(
		{
			leftTopPoint,
			rightBottomPoint,
			draggingPoint,
			keepProportion = false,
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
			onArrangementChangeStart(DragPointType.LeftTop);
		}, [onArrangementChangeStart]);

		const onDrag = useCallback(
			(e: DragEvent) => {
				const newArrangment = calcArrangement(e.point, rightBottomPoint);

				onArrangementChange(newArrangment);
			},
			[onArrangementChange, rightBottomPoint],
		);

		const onDragEnd = useCallback(
			(e: DragEvent) => {
				const newArrangment = calcArrangement(e.point, rightBottomPoint);

				onArrangementChangeEnd(newArrangment);
			},
			[onArrangementChangeEnd, rightBottomPoint],
		);

		const linerDragFunction = useCallback(
			(p: Point) =>
				createLinerDragY2xFunction(leftTopPoint, rightBottomPoint)(p),
			[leftTopPoint, rightBottomPoint],
		);

		if (draggingPoint && draggingPoint !== DragPointType.LeftTop) {
			return;
		}

		return (
			<DragPoint
				point={leftTopPoint}
				onDragStart={onDragStart}
				onDrag={onDrag}
				onDragEnd={onDragEnd}
				dragPositioningFunction={keepProportion ? linerDragFunction : undefined}
				cursor="nw-resize"
				hidden={hidden}
				ref={domRef}
			/>
		);
	},
);

export default DragPointLeftTop;
