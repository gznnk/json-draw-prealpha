import type React from "react";
import { useState } from "react";
import type Point from "../../types/Point";
import DraggablePoint from "./DraggablePoint";
import Line from "./Line";

const CIRCLE_DEFAULT_PROPS = {
	color: "rgba(0, 0, 0, 0)",
	hoverColor: "rgba(157, 204, 224, 0.7)",
};

type DraggableLineProps = {
	initialStartPoint: Point;
	initialEndPoint: Point;
	stroke?: string;
	strokeWidth?: number;
};

const getLineStart = (pointStart: Point, pointEnd: Point) => {
	const x = pointStart.x - (pointStart.x <= pointEnd.x ? 1 : 0);
	const y = pointStart.y - (pointStart.y <= pointEnd.y ? 1 : 0);
	return { x, y };
};

const getLineEnd = (pointStart: Point, pointEnd: Point) => {
	const x = pointEnd.x - (pointEnd.x <= pointStart.x ? 1 : 0);
	const y = pointEnd.y - (pointEnd.y <= pointStart.y ? 1 : 0);
	return { x, y };
};

const DraggableLine: React.FC<DraggableLineProps> = ({
	initialStartPoint,
	initialEndPoint,
	stroke = "black",
	strokeWidth = 1,
}) => {
	const [pointStart, setPointStart] = useState<Point>(initialStartPoint);
	const [pointEnd, setPointEnd] = useState<Point>(initialEndPoint);
	const [lineStart, setLineStart] = useState<Point>(
		getLineStart(initialStartPoint, initialEndPoint),
	);
	const [lineEnd, setLineEnd] = useState<Point>(
		getLineEnd(initialStartPoint, initialEndPoint),
	);

	const onStartPointDrag = (x: number, y: number) => {
		setPointStart({ x, y });
		setLineStart(getLineStart({ x, y }, pointEnd));
		setLineEnd(getLineEnd({ x, y }, pointEnd));
	};

	const onEndPointDrag = (x: number, y: number) => {
		setPointEnd({ x, y });
		setLineStart(getLineStart(pointStart, { x, y }));
		setLineEnd(getLineEnd(pointStart, { x, y }));
	};

	return (
		<>
			<DraggablePoint
				{...CIRCLE_DEFAULT_PROPS}
				initialPoint={pointStart}
				onDrag={onStartPointDrag}
				onDragEnd={onStartPointDrag}
			/>
			<DraggablePoint
				{...CIRCLE_DEFAULT_PROPS}
				initialPoint={pointEnd}
				onDrag={onEndPointDrag}
				onDragEnd={onEndPointDrag}
			/>
			<Line
				start={lineStart}
				end={lineEnd}
				stroke={stroke}
				strokeWidth={strokeWidth}
			/>
		</>
	);
};

export default DraggableLine;
