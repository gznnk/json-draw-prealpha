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
	const [state, setState] = useState({
		pointStart: initialStartPoint,
		pointEnd: initialEndPoint,
		pointStartPair: { x: initialStartPoint.x, y: initialEndPoint.y },
		pointEndPair: { x: initialEndPoint.x, y: initialStartPoint.y },
		rectStart: getRectStart(initialStartPoint, initialEndPoint),
		rectEnd: getRectEnd(initialStartPoint, initialEndPoint),
	});

	const onStartPointDrag = (x: number, y: number) => {
		const point = { x, y };

		setState((prevState) => ({
			...prevState,
			pointStart: point,
			pointStartPair: { x: point.x, y: prevState.pointStartPair.y },
			pointEndPair: { x: prevState.pointEndPair.x, y: point.y },
			rectStart: getRectStart(point, prevState.pointEnd),
			rectEnd: getRectEnd(point, prevState.pointEnd),
		}));
	};

	const onEndPointDrag = (x: number, y: number) => {
		const point = { x, y };

		setState((prevState) => ({
			...prevState,
			pointEnd: point,
			pointEndPair: { x: point.x, y: prevState.pointEndPair.y },
			pointStartPair: { x: prevState.pointStartPair.x, y: point.y },
			rectStart: getRectStart(prevState.pointStart, point),
			rectEnd: getRectEnd(prevState.pointStart, point),
		}));
	};

	const onStartPointPairDrag = (x: number, y: number) => {
		const point = { x, y };

		setState((prevState) => {
			const newPointStart = { x: point.x, y: prevState.pointStart.y };
			const newPointEnd = { x: prevState.pointEnd.x, y: point.y };

			return {
				...prevState,
				pointStartPair: point,
				pointStart: newPointStart,
				pointEnd: newPointEnd,
				rectStart: getRectStart(newPointStart, newPointEnd),
				rectEnd: getRectEnd(newPointStart, newPointEnd),
			};
		});
	};

	const onEndPointPairDrag = (x: number, y: number) => {
		const point = { x, y };

		setState((prevState) => {
			const newPointStart = { x: prevState.pointStart.x, y: point.y };
			const newPointEnd = { x: point.x, y: prevState.pointEnd.y };

			return {
				...prevState,
				pointEndPair: point,
				pointStart: newPointStart,
				pointEnd: newPointEnd,
				rectStart: getRectStart(newPointStart, newPointEnd),
				rectEnd: getRectEnd(newPointStart, newPointEnd),
			};
		});
	};

	return (
		<>
			<Rectangle start={state.rectStart} end={state.rectEnd}>
				{children}
			</Rectangle>
			<DraggablePoint
				{...CIRCLE_DEFAULT_PROPS}
				initialPoint={state.pointStart}
				onDrag={onStartPointDrag}
				onDragEnd={onStartPointDrag}
			/>
			<DraggablePoint
				{...CIRCLE_DEFAULT_PROPS}
				initialPoint={state.pointEnd}
				onDrag={onEndPointDrag}
				onDragEnd={onEndPointDrag}
			/>
			<DraggablePoint
				{...CIRCLE_DEFAULT_PROPS}
				initialPoint={state.pointStartPair}
				onDrag={onStartPointPairDrag}
				onDragEnd={onStartPointPairDrag}
			/>
			<DraggablePoint
				{...CIRCLE_DEFAULT_PROPS}
				initialPoint={state.pointEndPair}
				onDrag={onEndPointPairDrag}
				onDragEnd={onEndPointPairDrag}
			/>
		</>
	);
};

export default DraggableRectangle;
