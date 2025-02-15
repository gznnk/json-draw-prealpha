import type React from "react";
import { useState } from "react";
import type Point from "../../types/Point";
import Rectangle from "./Rectangle";
import DraggablePoint from "./DraggablePoint";

const CIRCLE_DEFAULT_PROPS = {
	diameter: 19,
	color: "rgba(0, 0, 0, 0)",
	// color: "rgba(157, 204, 224, 0.7)",
	hoverColor: "rgba(157, 204, 224, 0.7)",
};

type DraggableRectangleProps = {
	children?: React.ReactNode;
	initialStartPoint: Point;
	initialEndPoint: Point;
};

const getRectStart = (pointStart: Point, pointEnd: Point) => {
	const x = pointStart.x - (pointStart.x <= pointEnd.x ? 1 : 0);
	const y = pointStart.y - (pointStart.y <= pointEnd.y ? 1 : 0);
	return { x, y };
};

const getRectEnd = (pointStart: Point, pointEnd: Point) => {
	const x = pointEnd.x - (pointEnd.x <= pointStart.x ? 1 : 0);
	const y = pointEnd.y - (pointEnd.y <= pointStart.y ? 1 : 0);
	return { x, y };
};

const DraggableRectangle: React.FC<DraggableRectangleProps> = ({
	initialStartPoint,
	initialEndPoint,
	children,
}) => {
	const [pointStart, setPointStart] = useState<Point>(initialStartPoint);
	const [pointEnd, setPointEnd] = useState<Point>(initialEndPoint);

	const [pointStartPair, setPointStartPair] = useState<Point>({
		x: initialStartPoint.x,
		y: initialEndPoint.y,
	});
	const [pointEndPair, setPointEndPair] = useState<Point>({
		x: initialEndPoint.x,
		y: initialStartPoint.y,
	});

	const [rectStart, setRectStart] = useState<Point>(
		getRectStart(initialStartPoint, initialEndPoint),
	);
	const [rectEnd, setRectEnd] = useState<Point>(
		getRectEnd(initialStartPoint, initialEndPoint),
	);

	const onStartPointDrag = (x: number, y: number) => {
		setPointStart({ x, y });
		setPointStartPair({ x, y: pointStartPair.y });
		setPointEndPair({ x: pointEndPair.x, y });
		setRectStart(getRectStart({ x, y }, pointEnd));
		setRectEnd(getRectEnd({ x, y }, pointEnd));
	};

	const onEndPointDrag = (x: number, y: number) => {
		setPointEnd({ x, y });
		setPointEndPair({ x, y: pointEndPair.y });
		setPointStartPair({ x: pointStartPair.x, y });
		setRectStart(getRectStart(pointStart, { x, y }));
		setRectEnd(getRectEnd(pointStart, { x, y }));
	};

	const onStartPointPairDrag = (x: number, y: number) => {
		setPointStartPair({ x, y });

		const newPointStart = { x, y: pointStart.y };
		const newPointEnd = { x: pointEnd.x, y };

		setPointStart(newPointStart);
		setPointEnd(newPointEnd);

		setRectStart(getRectStart(newPointStart, newPointEnd));
		setRectEnd(getRectEnd(newPointStart, newPointEnd));
	};

	const onEndPointPairDrag = (x: number, y: number) => {
		setPointEndPair({ x, y });

		const newPointStart = { x: pointStart.x, y };
		const newPointEnd = { x, y: pointEnd.y };

		setPointStart(newPointStart);
		setPointEnd(newPointEnd);

		setRectStart(getRectStart(newPointStart, newPointEnd));
		setRectEnd(getRectEnd(newPointStart, newPointEnd));
	};

	return (
		<>
			<Rectangle start={rectStart} end={rectEnd}>
				{children}
			</Rectangle>
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
			<DraggablePoint
				{...CIRCLE_DEFAULT_PROPS}
				initialPoint={pointStartPair}
				onDrag={onStartPointPairDrag}
				onDragEnd={onStartPointPairDrag}
			/>
			<DraggablePoint
				{...CIRCLE_DEFAULT_PROPS}
				initialPoint={pointEndPair}
				onDrag={onEndPointPairDrag}
				onDragEnd={onEndPointPairDrag}
			/>
		</>
	);
};

export default DraggableRectangle;
