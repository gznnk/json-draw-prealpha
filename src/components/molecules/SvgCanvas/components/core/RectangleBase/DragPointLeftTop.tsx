// Reactのインポート
import { useRef, forwardRef, useImperativeHandle, useCallback } from "react";

// SvgCanvas関連型定義をインポート
import type { Point, DragEvent } from "../../../types";

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

const DragPointLeftTop = forwardRef<SVGGElement, RectangleBaseDragPointProps>(
	(
		{
			leftTopPoint,
			rightBottomPoint,
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
			(e: DragEvent) => calcArrangment(e.point, rightBottomPoint),
			[rightBottomPoint],
		);

		const linerDragFunction = useCallback(
			(p: Point) =>
				createLinerDragY2xFunction(leftTopPoint, rightBottomPoint)(p),
			[leftTopPoint, rightBottomPoint],
		);

		return (
			<RectangleBaseDragPointBase
				point={leftTopPoint}
				dragPointType={DragPointType.LeftTop}
				cursor="nw-resize"
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

export default DragPointLeftTop;
