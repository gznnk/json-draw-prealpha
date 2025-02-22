// Reactのインポート
import {
	forwardRef,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
} from "react";

// SvgCanvas関連型定義をインポート
import type { DragDirection, Point } from "../../../types/CoordinateTypes";
import type { DiagramDragEvent } from "../../../types/EventTypes";

// SvgCanvasコンポーネントをインポート
import DragPoint from "../DragPoint";

// RectangleBase関連型定義をインポート
import type {
	DragPointType,
	RectangleBaseArrangement,
} from "./RectangleBaseTypes";

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
	calcArrangmentFunction: (e: DiagramDragEvent) => RectangleBaseArrangement;
	judgeNewDragPointType: (
		newArrangement: RectangleBaseArrangement,
	) => DragPointType;
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
			judgeNewDragPointType,
		},
		ref,
	) => {
		const domRef = useRef<SVGGElement>({} as SVGGElement);
		useImperativeHandle(ref, () => domRef.current);

		// biome-ignore lint/correctness/useExhaustiveDependencies: 座標が変わった場合もフォーカス処理を行うため、pointも依存に含める
		useEffect(() => {
			if (dragEndPointType === dragPointType) {
				domRef.current?.focus();
			}
		}, [point, dragEndPointType, dragPointType]);

		const onDragStart = useCallback(() => {
			onArrangmentChangeStart({
				dragPointType,
			});
		}, [onArrangmentChangeStart, dragPointType]);

		const onDrag = useCallback(
			(e: DiagramDragEvent) => {
				onArrangmentChange({
					arrangment: calcArrangmentFunction(e),
				});
			},
			[calcArrangmentFunction, onArrangmentChange],
		);

		const onDragEnd = useCallback(
			(e: DiagramDragEvent) => {
				const newArrangment = calcArrangmentFunction(e);
				const newDataPoint = judgeNewDragPointType(newArrangment);

				onArrangmentChangeEnd({
					dragPointType: newDataPoint,
					arrangment: newArrangment,
				});
			},
			[calcArrangmentFunction, judgeNewDragPointType, onArrangmentChangeEnd],
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
