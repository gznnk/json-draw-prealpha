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

const DRAG_POINT_TYPE = DragPointType.LeftBottom;

const DragPointLeftTop = forwardRef<SVGGElement, RectangleBaseDragPointProps>(
	(
		{
			rightTopPoint,
			leftBottomPoint,
			isDragging,
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
			onArrangementChangeStart(DRAG_POINT_TYPE);
		}, [onArrangementChangeStart]);

		const onDrag = useCallback(
			(e: DragEvent) => {
				const newArrangment = calcArrangement(
					e.point,
					rightTopPoint,
					keepProportion,
				);

				onArrangementChange(newArrangment);
			},
			[onArrangementChange, rightTopPoint, keepProportion],
		);

		const onDragEnd = useCallback(
			(e: DragEvent) => {
				const newArrangment = calcArrangement(
					e.point,
					rightTopPoint,
					keepProportion,
				);

				onArrangementChangeEnd(newArrangment);
			},
			[onArrangementChangeEnd, rightTopPoint, keepProportion],
		);

		const linerDragFunction = useCallback(
			(p: Point) =>
				createLinerDragY2xFunction(rightTopPoint, leftBottomPoint)(p),
			[rightTopPoint, leftBottomPoint],
		);

		if (isDragging && draggingPoint !== DRAG_POINT_TYPE) {
			return;
		}

		return (
			<DragPoint
				point={leftBottomPoint}
				onDragStart={onDragStart}
				onDrag={onDrag}
				onDragEnd={onDragEnd}
				dragPositioningFunction={keepProportion ? linerDragFunction : undefined}
				cursor="sw-resize"
				hidden={hidden}
				ref={domRef}
			/>
		);
	},
);

export default DragPointLeftTop;
