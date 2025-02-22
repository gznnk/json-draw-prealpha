// Reactのインポート
import type React from "react";
import {
	forwardRef,
	memo,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
	useState,
} from "react";

// SvgCanvas関連型定義をインポート
import type { Point } from "../../../types/CoordinateTypes";
import type { DiagramRef } from "../../../types/DiagramTypes";
import type {
	DiagramChangeEvent,
	DiagramDragEvent,
	PointerDownEvent,
} from "../../../types/EventTypes";

// SvgCanvas関連コンポーネントをインポート
import Draggable from "../Draggable";

// RectangleBase関連型定義をインポート
import type {
	ArrangmentChangeEndEvent,
	ArrangmentChangeEvent,
	ArrangmentChangeStartEvent,
	RectangleBaseState,
} from "./RectangleBaseTypes";

// RectangleBase関連コンポーネントをインポート
import DragPointBottomCenter from "./DragPointBottomCenter";
import DragPointLeftBottom from "./DragPointLeftBottom";
import DragPointLeftCenter from "./DragPointLeftCenter";
import DragPointLeftTop from "./DragPointLeftTop";
import DragPointRightBottom from "./DragPointRightBottom";
import DragPointRightCenter from "./DragPointRightCenter";
import DragPointRightTop from "./DragPointRightTop";
import DragPointTopCenter from "./DragPointTopCenter";

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
	ref?: React.Ref<DiagramRef>;
	onPointerDown?: (e: PointerDownEvent) => void;
	onDiagramChange?: (e: DiagramChangeEvent) => void;
	onDiagramChangeEnd?: (e: DiagramChangeEvent) => void;
	children?: React.ReactNode;
};

const RectangleBase: React.FC<RectangleBaseProps> = memo(
	forwardRef<DiagramRef, RectangleBaseProps>(
		(
			{
				id,
				point,
				width,
				height,
				keepProportion = false,
				tabIndex = 0,
				isSelected = false,
				onPointerDown,
				onDiagramChange,
				onDiagramChangeEnd,
				children,
			},
			ref,
		) => {
			const [state, setState] = useState<RectangleBaseState>({
				id: id,
				...calcArrangment(point, { x: point.x + width, y: point.y + height }),
				aspectRatio: width / height,
				isDragging: false,
			});

			const draggableRef = useRef<SVGGElement>({} as SVGGElement);
			const outlineRef = useRef<SVGRectElement>({} as SVGRectElement);

			useImperativeHandle(ref, () => ({
				draggableRef,
			}));

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

			const onDragStart = useCallback((_e: DiagramDragEvent) => {
				setState((prevState) => ({
					...prevState,
					isDragging: true,
					dragEndPointType: undefined,
				}));
			}, []);

			const onDragEnd = useCallback(
				(e: DiagramDragEvent) => {
					setState((prevState) => ({
						...prevState,
						...calcArrangment(e.point, {
							x: e.point.x + prevState.width,
							y: e.point.y + prevState.height,
						}),
						isDragging: false,
					}));

					onDiagramChangeEnd?.({
						id,
						point: e.point,
					});
				},
				[onDiagramChangeEnd, id],
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

					onDiagramChange?.({
						id: state.id,
						point: newLeftTopPoint,
						width: newWidth,
						height: newHeight,
					});
				},
				[onDiagramChange, state.id],
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

					onDiagramChangeEnd?.({
						id,
						point: e.arrangment.leftTopPoint,
						width: e.arrangment.width,
						height: e.arrangment.height,
					});
				},
				[onDiagramChangeEnd, id, keepProportion],
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
	),
);

export default RectangleBase;
