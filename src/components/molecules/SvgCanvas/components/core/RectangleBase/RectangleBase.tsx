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
// SvgCanvas関連コンポーネントをインポート
import Draggable from "../Draggable";

// RectangleBase関連型定義をインポート
import type {
	RectangleBaseState,
	ArrangmentChangeStartEvent,
	ArrangmentChangeEvent,
	ArrangmentChangeEndEvent,
} from "./RectangleBaseTypes";
// RectangleBase関連コンポーネントをインポート
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
	id: string;
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
		});

		const draggableRef = useRef<SVGGElement>({} as SVGGElement);
		const outlineRef = useRef<SVGRectElement>({} as SVGRectElement);

		useEffect(() => {
			setState((prevState) => ({
				...prevState,
				id: id,
				...calcArrangment(point, {
					x: point.x + width,
					y: point.y + height,
				}),
				aspectRatio: width / height,
			}));
		}, [id, point, width, height]);

		// --- 以下全体のドラッグ ---

		const onDragStart = useCallback((_e: DragEvent) => {
			setState((prevState) => ({
				...prevState,
				isDragging: true,
				dragEndPointType: undefined,
			}));
		}, []);

		const onDragEnd = useCallback(
			(e: DragEvent) => {
				setState((prevState) => ({
					...prevState,
					...calcArrangment(e.point, {
						x: e.point.x + prevState.width,
						y: e.point.y + prevState.height,
					}),
					isDragging: false,
				}));

				onChangeEnd?.({
					id,
					point: e.point,
				});
			},
			[onChangeEnd, id],
		);

		// --- 以下点のドラッグ ---

		const onArrangmentChangeStart = useCallback(
			(e: ArrangmentChangeStartEvent) => {
				setState((prevState) => ({
					...prevState,
					draggingPointType: e.dragPointType,
				}));
			},
			[],
		);
		const onArrangmentChange = useCallback(
			(e: ArrangmentChangeEvent) => {
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
			(e: ArrangmentChangeEndEvent) => {
				setState((prevState) => ({
					...prevState,
					...e.arrangment,
					aspectRatio: keepProportion
						? prevState.aspectRatio
						: e.arrangment.width / e.arrangment.height,
					draggingPointType: undefined,
					dragEndPointType: e.dragPointType,
				}));

				onChangeEnd?.({
					id,
					point: e.arrangment.leftTopPoint,
					width: e.arrangment.width,
					height: e.arrangment.height,
				});
			},
			[onChangeEnd, id, keepProportion],
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
						/>
						{/* 左下 */}
						<DragPointLeftBottom
							{...state}
							keepProportion={keepProportion}
							onArrangmentChangeStart={onArrangmentChangeStart}
							onArrangmentChange={onArrangmentChange}
							onArrangmentChangeEnd={onArrangmentChangeEnd}
						/>
						{/* 右上 */}
						<DragPointRightTop
							{...state}
							keepProportion={keepProportion}
							onArrangmentChangeStart={onArrangmentChangeStart}
							onArrangmentChange={onArrangmentChange}
							onArrangmentChangeEnd={onArrangmentChangeEnd}
						/>
						{/* 右下 */}
						<DragPointRightBottom
							{...state}
							keepProportion={keepProportion}
							onArrangmentChangeStart={onArrangmentChangeStart}
							onArrangmentChange={onArrangmentChange}
							onArrangmentChangeEnd={onArrangmentChangeEnd}
						/>
						{/* 上中央 */}
						<DragPointTopCenter
							{...state}
							keepProportion={keepProportion}
							onArrangmentChangeStart={onArrangmentChangeStart}
							onArrangmentChange={onArrangmentChange}
							onArrangmentChangeEnd={onArrangmentChangeEnd}
						/>
						{/* 左中央 */}
						<DragPointLeftCenter
							{...state}
							keepProportion={keepProportion}
							onArrangmentChangeStart={onArrangmentChangeStart}
							onArrangmentChange={onArrangmentChange}
							onArrangmentChangeEnd={onArrangmentChangeEnd}
						/>
						{/* 右中央 */}
						<DragPointRightCenter
							{...state}
							keepProportion={keepProportion}
							onArrangmentChangeStart={onArrangmentChangeStart}
							onArrangmentChange={onArrangmentChange}
							onArrangmentChangeEnd={onArrangmentChangeEnd}
						/>
						{/* 下中央 */}
						<DragPointBottomCenter
							{...state}
							keepProportion={keepProportion}
							onArrangmentChangeStart={onArrangmentChangeStart}
							onArrangmentChange={onArrangmentChange}
							onArrangmentChangeEnd={onArrangmentChangeEnd}
						/>
					</>
				)}
			</>
		);
	},
);

export default RectangleBase;
