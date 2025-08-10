// Import React.
import type React from "react";
import { memo, useCallback, useRef } from "react";

// Import components.
import { DragLine } from "../../../core/DragLine";

// Import types.
import type { Point } from "../../../../types/core/Point";
import type { DiagramClickEvent } from "../../../../types/events/DiagramClickEvent";
import type { DiagramDragEvent } from "../../../../types/events/DiagramDragEvent";
import type { DiagramPointerEvent } from "../../../../types/events/DiagramPointerEvent";

// Import utils.
import { getCursorFromAngle } from "../../../../utils/shapes/common/getCursorFromAngle";
import { calcRadians } from "../../../../utils/math/points/calcRadians";
import { createLinearX2yFunction } from "../../../../utils/math/geometry/createLinearX2yFunction";
import { createLinearY2xFunction } from "../../../../utils/math/geometry/createLinearY2xFunction";
import { radiansToDegrees } from "../../../../utils/math/common/radiansToDegrees";
import { rotatePoint } from "../../../../utils/math/points/rotatePoint";

// Import local modules.
import type { SegmentData } from "./SegmentTypes";

/**
 * Line segment properties
 */
type SegmentProps = SegmentData & {
	rightAngleSegmentDrag: boolean;
	onPointerDown?: (e: DiagramPointerEvent) => void;
	onClick?: (e: DiagramClickEvent) => void;
	onDrag?: (e: DiagramDragEvent) => void;
	dragPositioningFunction?: (point: Point) => Point;
};

/**
 * Line segment component
 */
const SegmentComponent: React.FC<SegmentProps> = ({
	id,
	startX,
	startY,
	endX,
	endY,
	rightAngleSegmentDrag,
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

	// Use ref to hold referenced values to avoid frequent handler generation
	const refBusVal = {
		// State variables and functions
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
			? createLinearX2yFunction(rotateStartPoint, rotateEndPoint)(x)
			: createLinearY2xFunction(rotateStartPoint, rotateEndPoint)(x, y);
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
			onClick={onClick}
			onDrag={onDrag}
			dragPositioningFunction={
				rightAngleSegmentDrag ? dragPositioningFunction : undefined
			}
		/>
	);
};

export const Segment = memo(SegmentComponent);
