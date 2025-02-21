// Reactのインポート
import {
	useRef,
	forwardRef,
	useImperativeHandle,
	useCallback,
	useEffect,
} from "react";

// SvgCanvas関連型定義をインポート
import type { Point, DragEvent } from "../../../types";
import type { DragDirection } from "../../../types";
// SvgCanvasコンポーネントをインポート
import DragPoint from "../DragPoint";

// RectangleBase関連型定義をインポート
import type { RectangleBaseArrangement } from "./RectangleBaseTypes";
import type { DragPointType } from "./RectangleBaseTypes";

export type RectangleBaseDragPointBaseProps = {
	point: Point;
	dragPointType: DragPointType;
	direction?: DragDirection;
	allowXDecimal?: boolean;
	allowYDecimal?: boolean;
	cursor?: string;
	draggingPointType?: DragPointType;
	dragEndPointType?: DragPointType;
	hidden?: boolean;
	onArrangmentChangeStart: (e: { dragPointType: DragPointType }) => void;
	onArrangmentChange: (e: { arrangment: RectangleBaseArrangement }) => void;
	onArrangmentChangeEnd: (e: {
		dragPointType: DragPointType;
		arrangment: RectangleBaseArrangement;
	}) => void;
	dragPositioningFunction?: (point: Point) => Point;
	calcArrangmentFunction(e: DragEvent): RectangleBaseArrangement;
};

const RectangleBaseDragPointBase = forwardRef<
	SVGGElement,
	RectangleBaseDragPointBaseProps
>(
	(
		{
			point,
			dragPointType,
			direction,
			allowXDecimal,
			allowYDecimal,
			cursor,
			draggingPointType,
			dragEndPointType,
			hidden,
			onArrangmentChangeStart,
			onArrangmentChange,
			onArrangmentChangeEnd,
			dragPositioningFunction,
			calcArrangmentFunction,
		},
		ref,
	) => {
		const domRef = useRef<SVGGElement>({} as SVGGElement);
		useImperativeHandle(ref, () => domRef.current);

		useEffect(() => {
			if (dragEndPointType === dragPointType) {
				domRef.current?.focus();
			}
		}, [dragEndPointType, dragPointType]);

		const onDragStart = useCallback(() => {
			onArrangmentChangeStart({
				dragPointType,
			});
		}, [onArrangmentChangeStart, dragPointType]);

		const onDrag = useCallback(
			(e: DragEvent) => {
				onArrangmentChange({
					arrangment: calcArrangmentFunction(e),
				});
			},
			[calcArrangmentFunction, onArrangmentChange],
		);

		const onDragEnd = useCallback(
			(e: DragEvent) => {
				onArrangmentChangeEnd({
					dragPointType,
					arrangment: calcArrangmentFunction(e),
				});
			},
			[calcArrangmentFunction, onArrangmentChangeEnd, dragPointType],
		);

		if (draggingPointType && draggingPointType !== dragPointType) {
			return;
		}

		return (
			<DragPoint
				point={point}
				direction={direction}
				allowXDecimal={allowXDecimal}
				allowYDecimal={allowYDecimal}
				onDragStart={onDragStart}
				onDrag={onDrag}
				onDragEnd={onDragEnd}
				dragPositioningFunction={dragPositioningFunction}
				cursor={cursor}
				hidden={hidden}
				ref={domRef}
			/>
		);
	},
);

export default RectangleBaseDragPointBase;
