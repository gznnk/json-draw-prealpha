// Reactのインポート
import type React from "react";
import { useCallback } from "react";

// SvgCanvas関連型定義をインポート
import type { Point, DragEvent } from "../../../types";
// SvgCanvas関連コンポーネントをインポート
import Draggable from "../Draggable";

// RectangleBase関連型定義をインポート
import type { RectangleBaseArrangement } from "./RectangleBaseTypes";
import type { DragPointType } from "./RectangleBaseTypes";
import type { DragDirection } from "../../../types";

type DragLineProps = {
	startPoint: Point;
	endPoint: Point;
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
		dragPointType?: DragPointType;
		arrangment: RectangleBaseArrangement;
	}) => void;
	calcArrangmentFunction: (e: DragEvent) => RectangleBaseArrangement;
};

const DragLine: React.FC<DragLineProps> = ({
	startPoint,
	endPoint,
	dragPointType,
	direction,
	cursor,
	onArrangmentChangeStart,
	onArrangmentChange,
	onArrangmentChangeEnd,
	calcArrangmentFunction,
}) => {
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
				dragPointType: undefined,
				arrangment: calcArrangmentFunction(e),
			});
		},
		[calcArrangmentFunction, onArrangmentChangeEnd],
	);

	return (
		<Draggable
			point={startPoint}
			direction={direction}
			cursor={cursor}
			onDragStart={onDragStart}
			onDrag={onDrag}
			onDragEnd={onDragEnd}
		>
			<line
				x1={0}
				y1={0}
				x2={endPoint.x - startPoint.x}
				y2={endPoint.y - startPoint.y}
				stroke="transparent"
				strokeWidth={3}
			/>
		</Draggable>
	);
};

export default DragLine;
