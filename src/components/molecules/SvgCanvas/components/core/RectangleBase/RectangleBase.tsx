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
import { calcArrangement } from "./RectangleBaseFunctions";

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
			...calcArrangement(point, { x: point.x + width, y: point.y + height }),
			aspectRatio: width / height,
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

		//const updateDragPointFocus = useCallback(
		//(dragEndPoint: Point, newPoints: UpdatedPoints) => {
		// const focusElement = document.activeElement as HTMLElement;
		// if (focusElement) {
		// 	focusElement.blur();
		// }
		// const isPointEquals = (p1: Point, p2: Point) =>
		// 	Math.abs(p1.x - p2.x) < 1 && Math.abs(p1.y - p2.y) < 1;
		// setTimeout(() => {
		// 	if (isPointEquals(dragEndPoint, newPoints.leftTopPoint)) {
		// 		leftTopPointRef.current?.focus();
		// 	} else if (isPointEquals(dragEndPoint, newPoints.leftBottomPoint)) {
		// 		leftBottomPointRef.current?.focus();
		// 	} else if (isPointEquals(dragEndPoint, newPoints.rightTopPoint)) {
		// 		rightTopPointRef.current?.focus();
		// 	} else if (isPointEquals(dragEndPoint, newPoints.rightBottomPoint)) {
		// 		rightBottomPointRef.current?.focus();
		// 	} else if (isPointEquals(dragEndPoint, newPoints.topCenterPoint)) {
		// 		topCenterPointRef.current?.focus();
		// 	} else if (isPointEquals(dragEndPoint, newPoints.leftCenterPoint)) {
		// 		leftCenterPointRef.current?.focus();
		// 	} else if (isPointEquals(dragEndPoint, newPoints.rightCenterPoint)) {
		// 		rightCenterPointRef.current?.focus();
		// 	} else if (isPointEquals(dragEndPoint, newPoints.bottomCenterPoint)) {
		// 		bottomCenterPointRef.current?.focus();
		// 	}
		// }, 10); // TODO 次のレンダリングでフォーカスが移動するように修正したい
		//},
		//[],
		//);

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
					...calcArrangement(e.point, {
						x: e.point.x + state.width,
						y: e.point.y + state.height,
					}),
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
					aspectRatio: keepProportion
						? prevState.aspectRatio
						: newArrangment.width / newArrangment.height,
					draggingPoint: undefined,
				}));

				// TODO changeEndの伝番
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
							onArrangementChangeStart={onArrangementChangeStart}
							onArrangementChange={onArrangementChange}
							onArrangementChangeEnd={onArrangementChangeEnd}
							ref={leftTopPointRef}
						/>
						{/* 左下 */}
						<DragPointLeftBottom
							{...state}
							keepProportion={keepProportion}
							onArrangementChangeStart={onArrangementChangeStart}
							onArrangementChange={onArrangementChange}
							onArrangementChangeEnd={onArrangementChangeEnd}
							ref={leftBottomPointRef}
						/>
						{/* 右上 */}
						<DragPointRightTop
							{...state}
							keepProportion={keepProportion}
							onArrangementChangeStart={onArrangementChangeStart}
							onArrangementChange={onArrangementChange}
							onArrangementChangeEnd={onArrangementChangeEnd}
							ref={rightTopPointRef}
						/>
						{/* 右下 */}
						<DragPointRightBottom
							{...state}
							keepProportion={keepProportion}
							onArrangementChangeStart={onArrangementChangeStart}
							onArrangementChange={onArrangementChange}
							onArrangementChangeEnd={onArrangementChangeEnd}
							ref={rightBottomPointRef}
						/>
						{/* 上中央 */}
						<DragPointTopCenter
							{...state}
							keepProportion={keepProportion}
							onArrangementChangeStart={onArrangementChangeStart}
							onArrangementChange={onArrangementChange}
							onArrangementChangeEnd={onArrangementChangeEnd}
							ref={topCenterPointRef}
						/>
						{/* 左中央 */}
						<DragPointLeftCenter
							{...state}
							keepProportion={keepProportion}
							onArrangementChangeStart={onArrangementChangeStart}
							onArrangementChange={onArrangementChange}
							onArrangementChangeEnd={onArrangementChangeEnd}
							ref={leftCenterPointRef}
						/>
						{/* 右中央 */}
						<DragPointRightCenter
							{...state}
							keepProportion={keepProportion}
							onArrangementChangeStart={onArrangementChangeStart}
							onArrangementChange={onArrangementChange}
							onArrangementChangeEnd={onArrangementChangeEnd}
							ref={rightCenterPointRef}
						/>
						{/* 下中央 */}
						<DragPointBottomCenter
							{...state}
							keepProportion={keepProportion}
							onArrangementChangeStart={onArrangementChangeStart}
							onArrangementChange={onArrangementChange}
							onArrangementChangeEnd={onArrangementChangeEnd}
							ref={bottomCenterPointRef}
						/>
					</>
				)}
			</>
		);
	},
);

export default RectangleBase;
