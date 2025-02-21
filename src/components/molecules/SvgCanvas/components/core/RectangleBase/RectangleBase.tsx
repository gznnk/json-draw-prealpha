// Reactのインポート
import type React from "react";
import { useState, useRef, useCallback, useEffect, memo } from "react";

// SvgCanvas関連型定義をインポート
import type {
	Point,
	PointerDownEvent,
	DragEvent,
	ChangeEvent,
} from "../../../types";
// SvgCanvasコンポーネントをインポート
import Draggable from "../Draggable";

// RectangleBase関連型定義をインポート
import type {
	RectangleBaseState,
	RectangleBaseArrangement,
} from "./RectangleBaseTypes";
import type { DragPointType } from "./RectangleBaseTypes";
// RectangleBase関連型コンポーネントをインポート
import DragPointLeftTop from "./DragPointLeftTop";
import DragPointLeftBottom from "./DragPointLeftBottom";
import DragPointRightTop from "./DragPointRightTop";
import DragPointRightBottom from "./DragPointRightBottom";
import DragPointTopCenter from "./DragPointTopCenter";
import DragPointLeftCenter from "./DragPointLeftCenter";
import DragPointRightCenter from "./DragPointRightCenter";
import DragPointBottomCenter from "./DragPointBottomCenter";
// RectangleBase関連関数をインポート
import { calcArrangment } from "./RectangleBaseFunctions";

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
			...calcArrangment(point, { x: point.x + width, y: point.y + height }),
			aspectRatio: width / height,
			isDragging: false,
			draggingPointType: undefined,
			lastDragPoint: undefined,
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

		// useEffect(() => {
		// 	const focusElement = document.activeElement as HTMLElement;
		// 	if (focusElement && !state.lastDragPoint) {
		// 		focusElement.blur();
		// 	}

		// 	const isPointEquals = (p1: Point, p2: Point) =>
		// 		Math.abs(p1.x - p2.x) < 1 && Math.abs(p1.y - p2.y) < 1;

		// 	if (state.lastDragPoint) {
		// 		if (isPointEquals(state.lastDragPoint, state.leftTopPoint)) {
		// 			leftTopPointRef.current?.focus();
		// 		} else if (isPointEquals(state.lastDragPoint, state.leftBottomPoint)) {
		// 			leftBottomPointRef.current?.focus();
		// 		} else if (isPointEquals(state.lastDragPoint, state.rightTopPoint)) {
		// 			rightTopPointRef.current?.focus();
		// 		} else if (isPointEquals(state.lastDragPoint, state.rightBottomPoint)) {
		// 			rightBottomPointRef.current?.focus();
		// 		} else if (isPointEquals(state.lastDragPoint, state.topCenterPoint)) {
		// 			topCenterPointRef.current?.focus();
		// 		} else if (isPointEquals(state.lastDragPoint, state.leftCenterPoint)) {
		// 			leftCenterPointRef.current?.focus();
		// 		} else if (isPointEquals(state.lastDragPoint, state.rightCenterPoint)) {
		// 			rightCenterPointRef.current?.focus();
		// 		} else if (
		// 			isPointEquals(state.lastDragPoint, state.bottomCenterPoint)
		// 		) {
		// 			bottomCenterPointRef.current?.focus();
		// 		}
		// 	}
		// }, [state.lastDragPoint]);

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
		// 	[prevState.draggingPoint],
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
					...calcArrangment(e.point, {
						x: e.point.x + state.width,
						y: e.point.y + state.height,
					}),
					isDragging: false,
				}));
			},
			[state.width, state.height],
		);

		// --- 以下点のドラッグ ---

		const onArrangmentChangeStart = useCallback(
			(e: { dragPointType: DragPointType }) => {
				setState((prevState) => ({
					...prevState,
					draggingPointType: e.dragPointType,
				}));
			},
			[],
		);
		const onArrangmentChange = useCallback(
			(e: { arrangment: RectangleBaseArrangement }) => {
				const {
					point: newLeftTopPoint,
					width: newWidth,
					height: newHeight,
				} = e.arrangment;

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

		const onArrangmentChangeEnd = useCallback(
			(e: {
				dragPointType: DragPointType;
				arrangment: RectangleBaseArrangement;
			}) => {
				setState((prevState) => ({
					...prevState,
					...e.arrangment,
					aspectRatio: keepProportion
						? prevState.aspectRatio
						: e.arrangment.width / e.arrangment.height,
					draggingPointType: undefined,
				}));
			},
			[keepProportion],
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
				{isSelected && !state.isDragging && (
					<>
						,{/* 左上 */}
						<DragPointLeftTop
							{...state}
							keepProportion={keepProportion}
							onArrangmentChangeStart={onArrangmentChangeStart}
							onArrangmentChange={onArrangmentChange}
							onArrangmentChangeEnd={onArrangmentChangeEnd}
							ref={leftTopPointRef}
						/>
						{/* 左下 */}
						<DragPointLeftBottom
							{...state}
							keepProportion={keepProportion}
							onArrangmentChangeStart={onArrangmentChangeStart}
							onArrangmentChange={onArrangmentChange}
							onArrangmentChangeEnd={onArrangmentChangeEnd}
							ref={leftBottomPointRef}
						/>
						{/* 右上 */}
						<DragPointRightTop
							{...state}
							keepProportion={keepProportion}
							onArrangmentChangeStart={onArrangmentChangeStart}
							onArrangmentChange={onArrangmentChange}
							onArrangmentChangeEnd={onArrangmentChangeEnd}
							ref={rightTopPointRef}
						/>
						{/* 右下 */}
						<DragPointRightBottom
							{...state}
							keepProportion={keepProportion}
							onArrangmentChangeStart={onArrangmentChangeStart}
							onArrangmentChange={onArrangmentChange}
							onArrangmentChangeEnd={onArrangmentChangeEnd}
							ref={rightBottomPointRef}
						/>
						{/* 上中央 */}
						<DragPointTopCenter
							{...state}
							keepProportion={keepProportion}
							onArrangmentChangeStart={onArrangmentChangeStart}
							onArrangmentChange={onArrangmentChange}
							onArrangmentChangeEnd={onArrangmentChangeEnd}
							ref={topCenterPointRef}
						/>
						{/* 左中央 */}
						<DragPointLeftCenter
							{...state}
							keepProportion={keepProportion}
							onArrangmentChangeStart={onArrangmentChangeStart}
							onArrangmentChange={onArrangmentChange}
							onArrangmentChangeEnd={onArrangmentChangeEnd}
							ref={leftCenterPointRef}
						/>
						{/* 右中央 */}
						<DragPointRightCenter
							{...state}
							keepProportion={keepProportion}
							onArrangmentChangeStart={onArrangmentChangeStart}
							onArrangmentChange={onArrangmentChange}
							onArrangmentChangeEnd={onArrangmentChangeEnd}
							ref={rightCenterPointRef}
						/>
						{/* 下中央 */}
						<DragPointBottomCenter
							{...state}
							keepProportion={keepProportion}
							onArrangmentChangeStart={onArrangmentChangeStart}
							onArrangmentChange={onArrangmentChange}
							onArrangmentChangeEnd={onArrangmentChangeEnd}
							ref={bottomCenterPointRef}
						/>
					</>
				)}
			</>
		);
	},
);

export default RectangleBase;
