import type React from "react";
import { useState, useRef, useCallback, useEffect, memo } from "react";
import type {
	Point,
	PointerDownEvent,
	DragEvent,
	ChangeEvent,
} from "../../../types";
import { DragDirection, DragFunctionType } from "../../../types";
import Draggable from "../Draggable";
import type {
	RectangleBaseState,
	RectangleBaseArrangement,
} from "./RectangleBaseTypes";
import { DragPointType } from "./RectangleBaseTypes";

import RectangleBaseDragPoint from "./RectangleBaseDragPoint";

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
		const [state, setState] = useState<RectangleBaseState>({
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
			draggingPoint: undefined,
		});

		const draggableRef = useRef<SVGGElement>({} as SVGGElement);
		const outlineRef = useRef<SVGRectElement>({} as SVGRectElement);

		const leftTopPointRef = useRef<SVGGElement>({} as SVGGElement);
		const rightTopPointRef = useRef<SVGGElement>({} as SVGGElement);
		const leftBottomPointRef = useRef<SVGGElement>({} as SVGGElement);
		const rightBottomPointRef = useRef<SVGGElement>({} as SVGGElement);
		const topCenterPointRef = useRef<SVGGElement>({} as SVGGElement);
		const leftCenterPointRef = useRef<SVGGElement>({} as SVGGElement);
		const rightCenterPointRef = useRef<SVGGElement>({} as SVGGElement);
		const bottomCenterPointRef = useRef<SVGGElement>({} as SVGGElement);

		useEffect(() => {
			onChangeEnd?.({
				id: state.id,
				point: state.leftTopPoint,
				width: state.width,
				height: state.height,
			});
		}, [state.id, state.leftTopPoint, state.width, state.height, onChangeEnd]);

		// -- 以下共通関数 --

		// const updateDragPointFocus = useCallback(
		// 	(dragEndPoint: Point, newPoints: UpdatedPoints) => {
		// 		const focusElement = document.activeElement as HTMLElement;
		// 		if (focusElement) {
		// 			focusElement.blur();
		// 		}

		// 		const isPointEquals = (p1: Point, p2: Point) =>
		// 			Math.abs(p1.x - p2.x) < 1 && Math.abs(p1.y - p2.y) < 1;

		// 		setTimeout(() => {
		// 			if (isPointEquals(dragEndPoint, newPoints.leftTopPoint)) {
		// 				leftTopPointRef.current?.focus();
		// 			} else if (isPointEquals(dragEndPoint, newPoints.leftBottomPoint)) {
		// 				leftBottomPointRef.current?.focus();
		// 			} else if (isPointEquals(dragEndPoint, newPoints.rightTopPoint)) {
		// 				rightTopPointRef.current?.focus();
		// 			} else if (isPointEquals(dragEndPoint, newPoints.rightBottomPoint)) {
		// 				rightBottomPointRef.current?.focus();
		// 			} else if (isPointEquals(dragEndPoint, newPoints.topCenterPoint)) {
		// 				topCenterPointRef.current?.focus();
		// 			} else if (isPointEquals(dragEndPoint, newPoints.leftCenterPoint)) {
		// 				leftCenterPointRef.current?.focus();
		// 			} else if (isPointEquals(dragEndPoint, newPoints.rightCenterPoint)) {
		// 				rightCenterPointRef.current?.focus();
		// 			} else if (isPointEquals(dragEndPoint, newPoints.bottomCenterPoint)) {
		// 				bottomCenterPointRef.current?.focus();
		// 			}
		// 		}, 10); // TODO 次のレンダリングでフォーカスが移動するように修正したい
		// 	},
		// 	[],
		// );

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

		// --- 以下点のドラッグ ---

		const onArrangementChangeStart = useCallback(
			(dragPointType: DragPointType) => {
				setState((prevState) => ({
					...prevState,
					isDragging: true,
					draggingPoint: dragPointType,
				}));
			},
			[],
		);
		const onArrangementChange = useCallback(
			(newArrangment: RectangleBaseArrangement) => {
				const {
					point: newLeftTopPoint,
					width: newWidth,
					height: newHeight,
				} = newArrangment;

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

		const onArrangementChangeEnd = useCallback(
			(newArrangment: RectangleBaseArrangement) => {
				setState((prevState) => ({
					...prevState,
					...newArrangment,
					isDragging: false,
					draggingPoint: undefined,
				}));

				// TODO changeEndの伝番
			},
			[],
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
						{/* 左上 */}
						<RectangleBaseDragPoint
							dragPointType={DragPointType.LeftTop}
							dragPoint={state.leftTopPoint}
							scaleOriginPoint={state.rightBottomPoint}
							isDragging={state.isDragging}
							draggingPoint={state.draggingPoint}
							keepProportion={keepProportion}
							aspectRatio={state.aspectRatio}
							onArrangementChangeStart={onArrangementChangeStart}
							onArrangementChange={onArrangementChange}
							onArrangementChangeEnd={onArrangementChangeEnd}
							cursor="nw-resize"
							ref={leftTopPointRef}
						/>
						{/* 左下 */}
						<RectangleBaseDragPoint
							dragPointType={DragPointType.LeftBottom}
							dragPoint={state.leftBottomPoint}
							scaleOriginPoint={state.rightTopPoint}
							isDragging={state.isDragging}
							draggingPoint={state.draggingPoint}
							keepProportion={keepProportion}
							aspectRatio={state.aspectRatio}
							onArrangementChangeStart={onArrangementChangeStart}
							onArrangementChange={onArrangementChange}
							onArrangementChangeEnd={onArrangementChangeEnd}
							cursor="sw-resize"
							ref={leftBottomPointRef}
						/>
						{/* 右上 */}
						<RectangleBaseDragPoint
							dragPointType={DragPointType.RightTop}
							dragPoint={state.rightTopPoint}
							scaleOriginPoint={state.leftBottomPoint}
							isDragging={state.isDragging}
							draggingPoint={state.draggingPoint}
							keepProportion={keepProportion}
							aspectRatio={state.aspectRatio}
							onArrangementChangeStart={onArrangementChangeStart}
							onArrangementChange={onArrangementChange}
							onArrangementChangeEnd={onArrangementChangeEnd}
							cursor="ne-resize"
							ref={rightTopPointRef}
						/>
						{/* 右下 */}
						<RectangleBaseDragPoint
							dragPointType={DragPointType.RightBottom}
							dragPoint={state.rightBottomPoint}
							scaleOriginPoint={state.leftTopPoint}
							isDragging={state.isDragging}
							draggingPoint={state.draggingPoint}
							keepProportion={keepProportion}
							aspectRatio={state.aspectRatio}
							onArrangementChangeStart={onArrangementChangeStart}
							onArrangementChange={onArrangementChange}
							onArrangementChangeEnd={onArrangementChangeEnd}
							cursor="se-resize"
							ref={rightBottomPointRef}
						/>
						{/* 上中央 */}
						<RectangleBaseDragPoint
							dragPointType={DragPointType.TopCenter}
							direction={DragDirection.Vertical}
							dragPoint={state.topCenterPoint}
							scaleOriginPoint={state.leftBottomPoint}
							scaleDiagonalPoint={state.rightTopPoint}
							isDragging={state.isDragging}
							draggingPoint={state.draggingPoint}
							keepProportion={keepProportion}
							aspectRatio={state.aspectRatio}
							onArrangementChangeStart={onArrangementChangeStart}
							onArrangementChange={onArrangementChange}
							onArrangementChangeEnd={onArrangementChangeEnd}
							cursor="n-resize"
							ref={topCenterPointRef}
						/>
						{/* 左中央 */}
						<RectangleBaseDragPoint
							dragPointType={DragPointType.LeftCenter}
							direction={DragDirection.Horizontal}
							dragFunctionType={DragFunctionType.LinerX2y}
							dragPoint={state.leftCenterPoint}
							scaleOriginPoint={state.rightTopPoint}
							scaleDiagonalPoint={state.leftBottomPoint}
							isDragging={state.isDragging}
							draggingPoint={state.draggingPoint}
							keepProportion={keepProportion}
							aspectRatio={state.aspectRatio}
							onArrangementChangeStart={onArrangementChangeStart}
							onArrangementChange={onArrangementChange}
							onArrangementChangeEnd={onArrangementChangeEnd}
							cursor="w-resize"
							ref={leftCenterPointRef}
						/>
						{/* 右中央 */}
						<RectangleBaseDragPoint
							dragPointType={DragPointType.RightCenter}
							direction={DragDirection.Horizontal}
							dragFunctionType={DragFunctionType.LinerX2y}
							dragPoint={state.rightCenterPoint}
							scaleOriginPoint={state.leftTopPoint}
							scaleDiagonalPoint={state.rightBottomPoint}
							isDragging={state.isDragging}
							draggingPoint={state.draggingPoint}
							keepProportion={keepProportion}
							aspectRatio={state.aspectRatio}
							onArrangementChangeStart={onArrangementChangeStart}
							onArrangementChange={onArrangementChange}
							onArrangementChangeEnd={onArrangementChangeEnd}
							cursor="e-resize"
							ref={rightCenterPointRef}
						/>
						{/* 下中央 */}
						<RectangleBaseDragPoint
							dragPointType={DragPointType.BottomCenter}
							direction={DragDirection.Vertical}
							dragFunctionType={DragFunctionType.LinerY2x}
							dragPoint={state.bottomCenterPoint}
							scaleOriginPoint={state.leftTopPoint}
							scaleDiagonalPoint={state.rightBottomPoint}
							isDragging={state.isDragging}
							draggingPoint={state.draggingPoint}
							keepProportion={keepProportion}
							aspectRatio={state.aspectRatio}
							onArrangementChangeStart={onArrangementChangeStart}
							onArrangementChange={onArrangementChange}
							onArrangementChangeEnd={onArrangementChangeEnd}
							cursor="s-resize"
							ref={bottomCenterPointRef}
						/>
					</>
				)}
			</>
		);
	},
);

export default RectangleBase;
