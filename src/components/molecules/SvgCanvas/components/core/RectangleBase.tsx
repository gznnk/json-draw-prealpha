import type React from "react";
import { useState, useRef, useCallback, useEffect, memo } from "react";
import type {
	Point,
	PointerDownEvent,
	DragEvent,
	ChangeEvent,
} from "../../types";
import { DragDirection } from "../../types";
import DragPoint from "../diagram/DragPoint";
import Draggable from "./Draggable";

const createLinerDragY2xFunction = (p1: Point, p2: Point) => {
	const a = (p2.y - p1.y) / (p2.x - p1.x);
	const b = p1.y - a * p1.x;

	return (p: Point) => {
		console.log(`p: ${JSON.stringify(p)}`);
		return {
			x: (p.y - b) / a,
			y: p.y,
		};
	};
};

const createLinerDragX2yFunction = (p1: Point, p2: Point) => {
	const a = (p2.y - p1.y) / (p2.x - p1.x);
	const b = p1.y - a * p1.x;

	return (p: Point) => {
		return {
			x: p.x,
			y: a * p.x + b,
		};
	};
};

export type RectangleBaseProps = {
	id?: string;
	point: Point;
	width: number;
	height: number;
	keepProportion?: boolean;
	tabIndex?: number;
	isSelected?: boolean;
	onPointerDown?: (e: PointerDownEvent) => void;
	onChange?: (e: ChangeEvent) => void;
	onChangeEnd?: (e: ChangeEvent) => void;
	children?: React.ReactNode;
};

const RectangleBase: React.FC<RectangleBaseProps> = memo(
	({
		id,
		point,
		width,
		height,
		keepProportion = false,
		tabIndex = 0,
		isSelected = false,
		onPointerDown,
		onChange,
		onChangeEnd,
		children,
	}) => {
		const [state, setState] = useState({
			id: id,
			point: point,
			width: width,
			height: height,
			aspectRatio: width / height,
			leftTopPoint: point,
			leftBottomPoint: {
				x: point.x,
				y: point.y + height,
			},
			rightTopPoint: {
				x: point.x + width,
				y: point.y,
			},
			rightBottomPoint: {
				x: point.x + width,
				y: point.y + height,
			},
			topCenterPoint: {
				x: point.x + width / 2,
				y: point.y,
			},
			leftCenterPoint: {
				x: point.x,
				y: point.y + height / 2,
			},
			rightCenterPoint: {
				x: point.x + width,
				y: point.y + height / 2,
			},
			bottomCenterPoint: {
				x: point.x + width / 2,
				y: point.y + height,
			},
			isDragging: false,
			isLeftTopDragging: false,
			isLeftBottomDragging: false,
			isRightTopDragging: false,
			isRightBottomDragging: false,
			isTopCenterDragging: false,
			isLeftCenterDragging: false,
			isRightCenterDragging: false,
			isBottomCenterDragging: false,
		});

		const draggableRef = useRef<SVGGElement>({} as SVGGElement);
		const outlineRef = useRef<SVGRectElement>({} as SVGRectElement);

		useEffect(() => {
			onChangeEnd?.({
				id: state.id,
				point: state.leftTopPoint,
				width: state.width,
				height: state.height,
			});
		}, [state.id, state.leftTopPoint, state.width, state.height, onChangeEnd]);

		// -- 以下共通関数 --

		const updatedPoints = useCallback(
			(point: Point, diagonalPoint: Point) => {
				const top = Math.round(Math.min(point.y, diagonalPoint.y));
				const bottom = Math.round(Math.max(point.y, diagonalPoint.y));
				const left = Math.round(Math.min(point.x, diagonalPoint.x));
				const right = Math.round(Math.max(point.x, diagonalPoint.x));

				const leftTopPoint = {
					x: left,
					y: top,
				};

				const newWidth = right - left;
				const newHeight = bottom - top;

				const result = {
					point: leftTopPoint,
					width: newWidth,
					height: newHeight,
					leftTopPoint,
					leftBottomPoint: {
						x: left,
						y: bottom,
					},
					rightTopPoint: {
						x: right,
						y: top,
					},
					rightBottomPoint: {
						x: right,
						y: bottom,
					},
					topCenterPoint: {
						x: left + newWidth / 2,
						y: top,
					},
					leftCenterPoint: {
						x: left,
						y: top + newHeight / 2,
					},
					rightCenterPoint: {
						x: right,
						y: top + newHeight / 2,
					},
					bottomCenterPoint: {
						x: left + newWidth / 2,
						y: bottom,
					},
				} as {
					point: Point;
					width: number;
					height: number;
					aspectRatio?: number;
					leftTopPoint: Point;
					leftBottomPoint: Point;
					rightTopPoint: Point;
					rightBottomPoint: Point;
					topCenterPoint: Point;
					leftCenterPoint: Point;
					rightCenterPoint: Point;
					bottomCenterPoint: Point;
				};

				if (!keepProportion) {
					result.aspectRatio = newWidth / newHeight;
				}

				return result;
			},
			[keepProportion],
		);

		const updateDomPoints = useCallback(
			(newLeftTopPoint: Point, newWidth: number, newHeight: number) => {
				draggableRef.current?.setAttribute(
					"transform",
					`translate(${newLeftTopPoint.x}, ${newLeftTopPoint.y})`,
				);
				outlineRef.current?.setAttribute("width", `${newWidth}`);
				outlineRef.current?.setAttribute("height", `${newHeight}`);
				onChange?.({
					id: state.id,
					point: newLeftTopPoint,
					width: newWidth,
					height: newHeight,
				});
			},
			[onChange, state.id],
		);

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
					leftBottomPoint: {
						x: e.point.x,
						y: e.point.y + state.height,
					},
					rightTopPoint: {
						x: e.point.x + state.width,
						y: e.point.y,
					},
					rightBottomPoint: {
						x: e.point.x + state.width,
						y: e.point.y + state.height,
					},
					topCenterPoint: {
						x: e.point.x + state.width / 2,
						y: e.point.y,
					},
					leftCenterPoint: {
						x: e.point.x,
						y: e.point.y + state.height / 2,
					},
					rightCenterPoint: {
						x: e.point.x + state.width,
						y: e.point.y + state.height / 2,
					},
					bottomCenterPoint: {
						x: e.point.x + state.width / 2,
						y: e.point.y + state.height,
					},
					isDragging: false,
				}));
			},
			[state.width, state.height],
		);

		// --- 以下左上の点のドラッグ ---

		const onLeftTopDragStart = useCallback((_e: DragEvent) => {
			setState((prevState) => ({
				...prevState,
				isDragging: true,
				isLeftTopDragging: true,
			}));
		}, []);

		const onLeftTopDrag = useCallback(
			(e: DragEvent) => {
				const {
					leftTopPoint: newLeftTopPoint,
					width: newWidth,
					height: newHeight,
				} = updatedPoints(e.point, state.rightBottomPoint);

				updateDomPoints(newLeftTopPoint, newWidth, newHeight);
			},
			[updatedPoints, updateDomPoints, state.rightBottomPoint],
		);

		const onLeftTopDragEnd = useCallback(
			(e: DragEvent) => {
				const points = updatedPoints(e.point, state.rightBottomPoint);

				setState((prevState) => ({
					...prevState,
					...points,
					isDragging: false,
					isLeftTopDragging: false,
				}));
			},
			[updatedPoints, state.rightBottomPoint],
		);

		const leftTopLinerDragFunction = useCallback(
			(p: Point) =>
				createLinerDragY2xFunction(
					state.leftTopPoint,
					state.rightBottomPoint,
				)(p),
			[state.leftTopPoint, state.rightBottomPoint],
		);

		// --- 以下左下の点のドラッグ ---

		const onLeftBottomDragStart = useCallback((_e: DragEvent) => {
			setState((prevState) => ({
				...prevState,
				isDragging: true,
				isLeftBottomDragging: true,
			}));
		}, []);

		const onLeftBottomDrag = useCallback(
			(e: DragEvent) => {
				const {
					leftTopPoint: newLeftTopPoint,
					width: newWidth,
					height: newHeight,
				} = updatedPoints(e.point, state.rightTopPoint);

				updateDomPoints(newLeftTopPoint, newWidth, newHeight);
			},
			[updatedPoints, updateDomPoints, state.rightTopPoint],
		);

		const onLeftBottomDragEnd = useCallback(
			(e: DragEvent) => {
				const points = updatedPoints(e.point, state.rightTopPoint);

				setState((prevState) => ({
					...prevState,
					...points,
					isDragging: false,
					isLeftBottomDragging: false,
				}));
			},
			[updatedPoints, state.rightTopPoint],
		);

		const leftBottomLinerDragFunction = useCallback(
			(p: Point) =>
				createLinerDragY2xFunction(
					state.rightTopPoint,
					state.leftBottomPoint,
				)(p),
			[state.rightTopPoint, state.leftBottomPoint],
		);

		// --- 以下右上の点のドラッグ ---

		const onRightTopDragStart = useCallback((_e: DragEvent) => {
			setState((prevState) => ({
				...prevState,
				isDragging: true,
				isRightTopDragging: true,
			}));
		}, []);

		const onRightTopDrag = useCallback(
			(e: DragEvent) => {
				const {
					leftTopPoint: newLeftTopPoint,
					width: newWidth,
					height: newHeight,
				} = updatedPoints(e.point, state.leftBottomPoint);

				updateDomPoints(newLeftTopPoint, newWidth, newHeight);
			},
			[updatedPoints, updateDomPoints, state.leftBottomPoint],
		);

		const onRightTopDragEnd = useCallback(
			(e: DragEvent) => {
				const points = updatedPoints(e.point, state.leftBottomPoint);

				setState((prevState) => ({
					...prevState,
					...points,
					isDragging: false,
					isRightTopDragging: false,
				}));
			},
			[updatedPoints, state.leftBottomPoint],
		);

		const rightTopLinerDragFunction = useCallback(
			(p: Point) =>
				createLinerDragY2xFunction(
					state.rightTopPoint,
					state.leftBottomPoint,
				)(p),
			[state.rightTopPoint, state.leftBottomPoint],
		);

		// --- 以下右下の点のドラッグ ---

		const onRightBottomDragStart = useCallback((_e: DragEvent) => {
			setState((prevState) => ({
				...prevState,
				isDragging: true,
				isRightBottomDragging: true,
			}));
		}, []);

		const onRightBottomDrag = useCallback(
			(e: DragEvent) => {
				const {
					leftTopPoint: newLeftTopPoint,
					width: newWidth,
					height: newHeight,
				} = updatedPoints(e.point, state.leftTopPoint);

				updateDomPoints(newLeftTopPoint, newWidth, newHeight);
			},
			[updatedPoints, updateDomPoints, state.leftTopPoint],
		);

		const onRightBottomDragEnd = useCallback(
			(e: DragEvent) => {
				const points = updatedPoints(e.point, state.leftTopPoint);

				setState((prevState) => ({
					...prevState,
					...points,
					isDragging: false,
					isRightBottomDragging: false,
				}));
			},
			[updatedPoints, state.leftTopPoint],
		);

		const rightBottomLinerDragFunction = useCallback(
			(p: Point) =>
				createLinerDragY2xFunction(
					state.leftTopPoint,
					state.rightBottomPoint,
				)(p),
			[state.leftTopPoint, state.rightBottomPoint],
		);

		// --- 以下上中央の点のドラッグ ---

		const onTopCenterDragStart = useCallback((_e: DragEvent) => {
			setState((prevState) => ({
				...prevState,
				isDragging: true,
				isTopCenterDragging: true,
			}));
		}, []);

		const updateTopCenterPoint = useCallback(
			(e: DragEvent) => {
				if (keepProportion) {
					const newHeight = state.leftBottomPoint.y - e.point.y;
					const newWidth = newHeight * state.aspectRatio;

					const rightTopPoint = {
						x: state.leftTopPoint.x + newWidth,
						y: e.point.y,
					};

					return updatedPoints(state.leftBottomPoint, rightTopPoint);
				}

				const rightTopPoint = {
					x: state.topCenterPoint.x,
					y: e.point.y,
				};

				return updatedPoints(state.leftBottomPoint, rightTopPoint);
			},
			[
				updatedPoints,
				keepProportion,
				state.leftBottomPoint,
				state.leftTopPoint,
				state.topCenterPoint.x,
				state.aspectRatio,
			],
		);

		const onTopCenterDrag = useCallback(
			(e: DragEvent) => {
				const {
					leftTopPoint: newLeftTopPoint,
					width: newWidth,
					height: newHeight,
				} = updateTopCenterPoint(e);

				updateDomPoints(newLeftTopPoint, newWidth, newHeight);
			},
			[updateTopCenterPoint, updateDomPoints],
		);

		const onTopCenterDragEnd = useCallback(
			(e: DragEvent) => {
				const points = updateTopCenterPoint(e);

				setState((prevState) => ({
					...prevState,
					...points,
					isDragging: false,
					isTopCenterDragging: false,
				}));
			},
			[updateTopCenterPoint],
		);

		const topCenterLinerDragFunction = useCallback(
			(p: Point) =>
				createLinerDragY2xFunction(
					state.topCenterPoint,
					state.leftBottomPoint,
				)(p),
			[state.topCenterPoint, state.leftBottomPoint],
		);

		// --- 以下左中央の点のドラッグ ---

		const onLeftCenterDragStart = useCallback((_e: DragEvent) => {
			setState((prevState) => ({
				...prevState,
				isDragging: true,
				isLeftCenterDragging: true,
			}));
		}, []);

		const updateLeftCenterPoint = useCallback(
			(e: DragEvent) => {
				if (keepProportion) {
					const newWidth = state.rightBottomPoint.x - e.point.x;
					const newHeight = newWidth / state.aspectRatio;

					const leftTopPoint = {
						x: e.point.x,
						y: state.rightBottomPoint.y - newHeight,
					};

					return updatedPoints(leftTopPoint, state.rightBottomPoint);
				}

				const leftTopPoint = {
					x: e.point.x,
					y: state.leftCenterPoint.y,
				};

				return updatedPoints(leftTopPoint, state.rightBottomPoint);
			},
			[
				updatedPoints,
				keepProportion,
				state.rightBottomPoint,
				state.leftCenterPoint.y,
				state.aspectRatio,
			],
		);

		const onLeftCenterDrag = useCallback(
			(e: DragEvent) => {
				const {
					leftTopPoint: newLeftTopPoint,
					width: newWidth,
					height: newHeight,
				} = updateLeftCenterPoint(e);

				updateDomPoints(newLeftTopPoint, newWidth, newHeight);
			},
			[updateLeftCenterPoint, updateDomPoints],
		);

		const onLeftCenterDragEnd = useCallback(
			(e: DragEvent) => {
				const points = updateLeftCenterPoint(e);

				setState((prevState) => ({
					...prevState,
					...points,
					isDragging: false,
					isLeftCenterDragging: false,
				}));
			},
			[updateLeftCenterPoint],
		);

		const leftCenterLinerDragFunction = useCallback(
			(p: Point) =>
				createLinerDragX2yFunction(
					state.leftCenterPoint,
					state.rightBottomPoint,
				)(p),
			[state.leftCenterPoint, state.rightBottomPoint],
		);

		// --- 以下右中央の点のドラッグ ---

		const onRightCenterDragStart = useCallback((_e: DragEvent) => {
			setState((prevState) => ({
				...prevState,
				isDragging: true,
				isRightCenterDragging: true,
			}));
		}, []);

		const updateRightCenterPoint = useCallback(
			(e: DragEvent) => {
				if (keepProportion) {
					const newWidth = e.point.x - state.leftBottomPoint.x;
					const newHeight = newWidth / state.aspectRatio;

					const rightTopPoint = {
						x: e.point.x,
						y: state.leftBottomPoint.y - newHeight,
					};

					return updatedPoints(state.leftBottomPoint, rightTopPoint);
				}

				const rightBottomPoint = {
					x: e.point.x,
					y: state.rightBottomPoint.y,
				};

				return updatedPoints(state.leftTopPoint, rightBottomPoint);
			},
			[
				updatedPoints,
				keepProportion,
				state.leftBottomPoint,
				state.leftTopPoint,
				state.rightBottomPoint,
				state.aspectRatio,
			],
		);

		const onRightCenterDrag = useCallback(
			(e: DragEvent) => {
				const {
					leftTopPoint: newLeftTopPoint,
					width: newWidth,
					height: newHeight,
				} = updateRightCenterPoint(e);

				updateDomPoints(newLeftTopPoint, newWidth, newHeight);
			},
			[updateRightCenterPoint, updateDomPoints],
		);

		const onRightCenterDragEnd = useCallback(
			(e: DragEvent) => {
				const points = updateRightCenterPoint(e);

				setState((prevState) => ({
					...prevState,
					...points,
					isDragging: false,
					isRightCenterDragging: false,
				}));
			},
			[updateRightCenterPoint],
		);

		const rightCenterLinerDragFunction = useCallback(
			(p: Point) =>
				createLinerDragX2yFunction(
					state.rightCenterPoint,
					state.leftBottomPoint,
				)(p),
			[state.rightCenterPoint, state.leftBottomPoint],
		);

		// --- 以下下中央の点のドラッグ ---

		const onBottomCenterDragStart = useCallback((_e: DragEvent) => {
			setState((prevState) => ({
				...prevState,
				isDragging: true,
				isBottomCenterDragging: true,
			}));
		}, []);

		const updateBottomCenterPoint = useCallback(
			(e: DragEvent) => {
				if (keepProportion) {
					const newHeight = e.point.y - state.leftTopPoint.y;
					const newWidth = newHeight * state.aspectRatio;

					const rightBottomPoint = {
						x: state.leftTopPoint.x + newWidth,
						y: e.point.y,
					};

					return updatedPoints(state.leftTopPoint, rightBottomPoint);
				}

				const rightBottomPoint = {
					x: state.rightBottomPoint.x,
					y: e.point.y,
				};

				return updatedPoints(state.leftTopPoint, rightBottomPoint);
			},
			[
				updatedPoints,
				keepProportion,
				state.leftTopPoint,
				state.rightBottomPoint.x,
				state.aspectRatio,
			],
		);

		const onBottomCenterDrag = useCallback(
			(e: DragEvent) => {
				const {
					leftTopPoint: newLeftTopPoint,
					width: newWidth,
					height: newHeight,
				} = updateBottomCenterPoint(e);

				updateDomPoints(newLeftTopPoint, newWidth, newHeight);
			},
			[updateBottomCenterPoint, updateDomPoints],
		);

		const onBottomCenterDragEnd = useCallback(
			(e: DragEvent) => {
				const points = updateBottomCenterPoint(e);

				setState((prevState) => ({
					...prevState,
					...points,
					isDragging: false,
					isBottomCenterDragging: false,
				}));
			},
			[updateBottomCenterPoint],
		);

		const bottomCenterLinerDragFunction = useCallback(
			(p: Point) =>
				createLinerDragY2xFunction(
					state.leftTopPoint,
					state.bottomCenterPoint,
				)(p),
			[state.leftTopPoint, state.bottomCenterPoint],
		);

		// ポインターダウン時の処理
		const handlePointerDown = useCallback(
			(e: PointerDownEvent) => {
				onPointerDown?.({
					id: id,
					point: e.point,
					reactEvent: e.reactEvent,
				});
			},
			[id, onPointerDown],
		);

		// 各ドラッグポイントの移動関数を生成

		return (
			<>
				<Draggable
					id={id}
					point={state.point}
					tabIndex={tabIndex}
					onPointerDown={handlePointerDown}
					onDragStart={onDragStart}
					onDragEnd={onDragEnd}
					ref={draggableRef}
				>
					{children}
					{isSelected && (
						<rect
							x={0}
							y={0}
							width={width}
							height={height}
							fill="transparent"
							stroke="blue"
							strokeWidth="1px"
							strokeDasharray="3,3"
							ref={outlineRef}
						/>
					)}
				</Draggable>
				{isSelected && (
					<>
						,{/* 左上 */}
						<DragPoint
							point={state.leftTopPoint}
							onDragStart={onLeftTopDragStart}
							onDrag={onLeftTopDrag}
							onDragEnd={onLeftTopDragEnd}
							dragPositioningFunction={
								keepProportion ? leftTopLinerDragFunction : undefined
							}
							cursor="nw-resize"
							hidden={state.isDragging && !state.isLeftTopDragging}
						/>
						{/* 左下 */}
						<DragPoint
							point={state.leftBottomPoint}
							onDragStart={onLeftBottomDragStart}
							onDrag={onLeftBottomDrag}
							onDragEnd={onLeftBottomDragEnd}
							dragPositioningFunction={
								keepProportion ? leftBottomLinerDragFunction : undefined
							}
							cursor="sw-resize"
							hidden={state.isDragging && !state.isLeftBottomDragging}
						/>
						{/* 右上 */}
						<DragPoint
							point={state.rightTopPoint}
							onDragStart={onRightTopDragStart}
							onDrag={onRightTopDrag}
							onDragEnd={onRightTopDragEnd}
							dragPositioningFunction={
								keepProportion ? rightTopLinerDragFunction : undefined
							}
							cursor="ne-resize"
							hidden={state.isDragging && !state.isRightTopDragging}
						/>
						{/* 右下 */}
						<DragPoint
							point={state.rightBottomPoint}
							onDragStart={onRightBottomDragStart}
							onDrag={onRightBottomDrag}
							onDragEnd={onRightBottomDragEnd}
							dragPositioningFunction={
								keepProportion ? rightBottomLinerDragFunction : undefined
							}
							cursor="se-resize"
							hidden={state.isDragging && !state.isRightBottomDragging}
						/>
						{/* 上中央 */}
						<DragPoint
							point={state.topCenterPoint}
							direction={DragDirection.Vertical}
							allowXDecimal
							onDragStart={onTopCenterDragStart}
							onDrag={onTopCenterDrag}
							onDragEnd={onTopCenterDragEnd}
							dragPositioningFunction={
								keepProportion ? topCenterLinerDragFunction : undefined
							}
							cursor="n-resize"
							hidden={state.isDragging && !state.isTopCenterDragging}
						/>
						{/* 左中央 */}
						<DragPoint
							point={state.leftCenterPoint}
							direction={DragDirection.Horizontal}
							allowYDecimal
							onDragStart={onLeftCenterDragStart}
							onDrag={onLeftCenterDrag}
							onDragEnd={onLeftCenterDragEnd}
							dragPositioningFunction={
								keepProportion ? leftCenterLinerDragFunction : undefined
							}
							cursor="w-resize"
							hidden={state.isDragging && !state.isLeftCenterDragging}
						/>
						{/* 右中央 */}
						<DragPoint
							point={state.rightCenterPoint}
							direction={DragDirection.Horizontal}
							allowYDecimal
							onDragStart={onRightCenterDragStart}
							onDrag={onRightCenterDrag}
							onDragEnd={onRightCenterDragEnd}
							dragPositioningFunction={
								keepProportion ? rightCenterLinerDragFunction : undefined
							}
							cursor="e-resize"
							hidden={state.isDragging && !state.isRightCenterDragging}
						/>
						{/* 下中央 */}
						<DragPoint
							point={state.bottomCenterPoint}
							direction={DragDirection.Vertical}
							allowXDecimal
							onDragStart={onBottomCenterDragStart}
							onDrag={onBottomCenterDrag}
							onDragEnd={onBottomCenterDragEnd}
							dragPositioningFunction={
								keepProportion ? bottomCenterLinerDragFunction : undefined
							}
							cursor="s-resize"
							hidden={state.isDragging && !state.isBottomCenterDragging}
						/>
					</>
				)}
			</>
		);
	},
);

export default RectangleBase;
