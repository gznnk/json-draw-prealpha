import type React from "react";
import { useState, useRef, useCallback } from "react";
import type Point from "../../../types/Point";
import DragPoint from "./DragPoint";
import Draggable from "./Draggable";
import type { DragEvent } from "./Draggable";

type RectangleProps = {
	initialPoint: Point;
	initialWidth: number;
	initialHeight: number;
	children?: React.ReactNode;
};

const Rectangle: React.FC<RectangleProps> = ({
	initialPoint,
	initialWidth,
	initialHeight,
	children,
}) => {
	const [state, setState] = useState({
		point: initialPoint,
		width: initialWidth,
		height: initialHeight,
		leftTopPoint: initialPoint,
		rightBottomPoint: {
			x: initialPoint.x + initialWidth,
			y: initialPoint.y + initialHeight,
		},
		isDragging: false,
	});

	const draggableRef = useRef<SVGGElement | null>(null);
	const rectRef = useRef<SVGRectElement | null>(null);

	// --- 以下四角形全体のドラッグ ---

	const onDragStart = useCallback((_e: DragEvent) => {
		setState((prevState) => ({
			...prevState,
			isDragging: true,
		}));
	}, []);

	const onDragEnd = useCallback(
		(e: DragEvent) => {
			setState((prevState) => ({
				...prevState,
				point: e.point,
				leftTopPoint: e.point,
				rightBottomPoint: {
					x: e.point.x + state.width,
					y: e.point.y + state.height,
				},
				isDragging: false,
			}));
		},
		[state.width, state.height],
	);

	// --- 以下左上の点のドラッグ ---

	const onLeftTopDragPoints = useCallback(
		(e: DragEvent) => {
			const isVerticalReverse = state.rightBottomPoint.y < e.point.y;
			const isHorizontalReverse = state.rightBottomPoint.x < e.point.x;

			const point = {
				x: isHorizontalReverse ? state.rightBottomPoint.x : e.point.x,
				y: isVerticalReverse ? state.rightBottomPoint.y : e.point.y,
			};

			const rightBottomPoint = {
				x: isHorizontalReverse ? e.point.x : state.rightBottomPoint.x,
				y: isVerticalReverse ? e.point.y : state.rightBottomPoint.y,
			};

			return {
				point,
				rightBottomPoint,
				width: rightBottomPoint.x - point.x,
				height: rightBottomPoint.y - point.y,
			};
		},
		[state.rightBottomPoint],
	);

	const onLeftTopDrag = useCallback(
		(e: DragEvent) => {
			const { point, width, height } = onLeftTopDragPoints(e);

			draggableRef.current?.setAttribute(
				"transform",
				`translate(${point.x}, ${point.y})`,
			);
			rectRef.current?.setAttribute("width", `${width}`);
			rectRef.current?.setAttribute("height", `${height}`);
		},
		[onLeftTopDragPoints],
	);

	const onLeftTopDragEnd = useCallback(
		(e: DragEvent) => {
			const { point, rightBottomPoint, width, height } = onLeftTopDragPoints(e);

			setState((prevState) => ({
				...prevState,
				point,
				rightBottomPoint,
				width,
				height,
			}));
		},
		[onLeftTopDragPoints],
	);

	// --- 以下右下の点のドラッグ ---

	const onRightBottomDragPoints = useCallback(
		(e: DragEvent) => {
			const isVerticalReverse = e.point.y < state.leftTopPoint.y;
			const isHorizontalReverse = e.point.x < state.leftTopPoint.x;

			const point = {
				x: isHorizontalReverse ? e.point.x : state.leftTopPoint.x,
				y: isVerticalReverse ? e.point.y : state.leftTopPoint.y,
			};

			const rightBottomPoint = {
				x: isHorizontalReverse ? state.leftTopPoint.x : e.point.x,
				y: isVerticalReverse ? state.leftTopPoint.y : e.point.y,
			};

			return {
				point,
				rightBottomPoint,
				width: rightBottomPoint.x - point.x,
				height: rightBottomPoint.y - point.y,
			};
		},
		[state.leftTopPoint],
	);

	const onRightBottomDrag = useCallback(
		(e: DragEvent) => {
			const { point, width, height } = onRightBottomDragPoints(e);

			draggableRef.current?.setAttribute(
				"transform",
				`translate(${point.x}, ${point.y})`,
			);
			rectRef.current?.setAttribute("width", `${width}`);
			rectRef.current?.setAttribute("height", `${height}`);
		},
		[onRightBottomDragPoints],
	);

	const onRightBottomDragEnd = useCallback(
		(e: DragEvent) => {
			const { point, rightBottomPoint, width, height } =
				onRightBottomDragPoints(e);

			setState((prevState) => ({
				...prevState,
				point,
				rightBottomPoint,
				width,
				height,
			}));
		},
		[onRightBottomDragPoints],
	);

	return (
		<>
			<Draggable
				initialPoint={state.point}
				onDragStart={onDragStart}
				onDragEnd={onDragEnd}
				ref={draggableRef}
			>
				<rect
					x={0}
					y={0}
					width={state.width}
					height={state.height}
					ref={rectRef}
				>
					{children}
				</rect>
			</Draggable>
			<DragPoint
				initialPoint={state.leftTopPoint}
				onDrag={onLeftTopDrag}
				onDragEnd={onLeftTopDragEnd}
				hidden={state.isDragging}
			/>
			<DragPoint
				initialPoint={state.rightBottomPoint}
				onDrag={onRightBottomDrag}
				onDragEnd={onRightBottomDragEnd}
				hidden={state.isDragging}
			/>
		</>
	);
};

export default Rectangle;
