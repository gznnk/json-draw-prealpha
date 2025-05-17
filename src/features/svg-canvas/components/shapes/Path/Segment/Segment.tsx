// Import React.
import type React from "react";
import { memo, useCallback, useRef } from "react";

// Import components related to SvgCanvas.
import { DragLine } from "../../../core/DragLine";

// Import types related to SvgCanvas.
import type { Point } from "../../../../types/base/Point";
import type { DiagramClickEvent } from "../../../../types/events/DiagramClickEvent";
import type { DiagramDragEvent } from "../../../../types/events/DiagramDragEvent";
import type { DiagramPointerEvent } from "../../../../types/events/DiagramPointerEvent";

// Import functions related to SvgCanvas.
import { getCursorFromAngle } from "../../../../utils/shapes/common/getCursorFromAngle";
import { calcRadians } from "../../../../utils/math/points/calcRadians";
import { createLinerX2yFunction } from "../../../../utils/math/geometry/createLinerX2yFunction";
import { createLinerY2xFunction } from "../../../../utils/math/geometry/createLinerY2xFunction";
import { radiansToDegrees } from "../../../../utils/math/common/radiansToDegrees";
import { rotatePoint } from "../../../../utils/math/points/rotatePoint";

// Imports related to this component.
import type { SegmentData } from "./SegmentTypes";

/**
 * 線分プロパティ
 */
type SegmentProps = SegmentData & {
	rightAngleSegmentDrag: boolean;
	onPointerDown?: (e: DiagramPointerEvent) => void;
	onClick?: (e: DiagramClickEvent) => void;
	onDrag?: (e: DiagramDragEvent) => void;
	dragPositioningFunction?: (point: Point) => Point;
};

/**
 * 線分コンポーネント
 */
const SegmentComponent: React.FC<SegmentProps> = ({
	id,
	startX,
	startY,
	endX,
	endY,
	rightAngleSegmentDrag,
	onPointerDown,
	onClick,
	onDrag,
}) => {
	const midX = (startX + endX) / 2;
	const midY = (startY + endY) / 2;

	const rotateStartPoint = rotatePoint(startX, startY, midX, midY, Math.PI / 2);
	const rotateEndPoint = rotatePoint(endX, endY, midX, midY, Math.PI / 2);

	const radian = calcRadians(
		rotateStartPoint.x,
		rotateStartPoint.y,
		rotateEndPoint.x,
		rotateEndPoint.y,
	);
	const cursor = rightAngleSegmentDrag
		? getCursorFromAngle(radiansToDegrees(radian))
		: "move";

	// ハンドラ生成の頻発を回避するため、参照する値をuseRefで保持する
	const refBusVal = {
		// 内部変数・内部関数
		radian,
		rotateStartPoint,
		rotateEndPoint,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	const dragPositioningFunction = useCallback((x: number, y: number) => {
		const { radian, rotateStartPoint, rotateEndPoint } = refBus.current;

		const degrees = radiansToDegrees(radian);
		const isX2y = (degrees + 405) % 180 > 90;
		return isX2y
			? createLinerX2yFunction(rotateStartPoint, rotateEndPoint)(x, y)
			: createLinerY2xFunction(rotateStartPoint, rotateEndPoint)(x, y);
	}, []);

	return (
		<DragLine
			id={id}
			x={midX}
			y={midY}
			startX={startX}
			startY={startY}
			endX={endX}
			endY={endY}
			cursor={cursor}
			onPointerDown={onPointerDown}
			onClick={onClick}
			onDrag={onDrag}
			dragPositioningFunction={
				rightAngleSegmentDrag ? dragPositioningFunction : undefined
			}
		/>
	);
};

export const Segment = memo(SegmentComponent);
