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
import type { DiagramBaseProps } from "../../../types/DiagramTypes";
import type {
	DiagramDragEvent,
	DiagramPointerEvent,
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

export type RectangleBaseProps = DiagramBaseProps & {
	tabIndex?: number;
	children?: React.ReactNode;
	ref?: React.Ref<SVGGElement>;
};

const RectangleBase: React.FC<RectangleBaseProps> = memo(
	forwardRef<SVGGElement, RectangleBaseProps>(
		(
			{
				id,
				point,
				width,
				height,
				keepProportion = false,
				tabIndex = 0,
				isSelected = false,
				onDiagramClick,
				onDiagramDragStart,
				onDiagramDrag,
				onDiagramDragEnd,
				onDiagramResizeStart,
				onDiagramResizing,
				onDiagramResizeEnd,
				onDiagramSelect,
				children,
			},
			ref,
		) => {
			const [state, setState] = useState<RectangleBaseState>({
				...calcArrangment(point, { x: point.x + width, y: point.y + height }),
				aspectRatio: width / height,
				isDragging: false,
			});
			const [isShiftKeyDown, setShiftKeyDown] = useState(false);

			const _keepProportion = isShiftKeyDown || keepProportion;

			const draggableRef = useRef<SVGGElement>({} as SVGGElement);
			const outlineRef = useRef<SVGRectElement>({} as SVGRectElement);

			useImperativeHandle(ref, () => draggableRef.current);

			/**
			 * Propsの変更を検知して状態を更新
			 */
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

			/**
			 * ドラッグ開始イベントハンドラ
			 *
			 * @param {DiagramDragEvent} e ドラッグイベント
			 * @returns {void}
			 */
			const onDragStart = useCallback(
				(e: DiagramDragEvent) => {
					// 親にドラッグ開始イベントを通知
					onDiagramDragStart?.({
						id,
						old: {
							point: e.old.point,
							width: state.width,
							height: state.height,
						},
						new: {
							point: e.new.point,
							width: state.width,
							height: state.height,
						},
					});

					// ドラッグ中フラグを立てる
					setState((prevState) => ({
						...prevState,
						isDragging: true,
						dragEndPointType: undefined,
					}));
				},
				[onDiagramDragStart, id, state.width, state.height],
			);

			/**
			 * ドラッグ中イベントハンドラ
			 *
			 * @param {DiagramDragEvent} e ドラッグイベント
			 * @returns {void}
			 */
			const onDrag = useCallback(
				(e: DiagramDragEvent) => {
					// 親にドラッグ中イベントを通知
					onDiagramDrag?.({
						id,
						old: {
							point: e.old.point,
							width: state.width,
							height: state.height,
						},
						new: {
							point: e.new.point,
							width: state.width,
							height: state.height,
						},
					});
				},
				[onDiagramDrag, id, state.width, state.height],
			);

			/**
			 * ドラッグ終了イベントハンドラ
			 *
			 * @param {DiagramDragEvent} e ドラッグイベント
			 * @returns {void}
			 */
			const onDragEnd = useCallback(
				(e: DiagramDragEvent) => {
					// 親にドラッグ終了イベントを通知
					onDiagramDragEnd?.({
						id,
						old: {
							point: e.old.point,
							width: state.width,
							height: state.height,
						},
						new: {
							point: e.new.point,
							width: state.width,
							height: state.height,
						},
					});

					// ドラッグポイントの位置を更新
					setState((prevState) => ({
						...prevState,
						...calcArrangment(e.new.point, {
							x: e.new.point.x + prevState.width,
							y: e.new.point.y + prevState.height,
						}),
						isDragging: false,
					}));
				},
				[onDiagramDragEnd, id, state.width, state.height],
			);

			// --- 以下点のドラッグ ---

			const onArrangmentChangeStart = useCallback(
				(e: ArrangmentChangeStartEvent) => {
					onDiagramResizeStart?.({
						id,
						point: state.point,
						width: state.width,
						height: state.height,
					});

					setState((prevState) => ({
						...prevState,
						draggingPointType: e.dragPointType,
					}));
				},
				[onDiagramResizeStart, id, state.point, state.width, state.height],
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

					onDiagramResizing?.({
						id: id,
						point: newLeftTopPoint,
						width: newWidth,
						height: newHeight,
					});
				},
				[onDiagramResizing, id],
			);

			const onArrangmentChangeEnd = useCallback(
				(e: ArrangmentChangeEndEvent) => {
					setState((prevState) => ({
						...prevState,
						...e.arrangment,
						aspectRatio: _keepProportion
							? prevState.aspectRatio
							: e.arrangment.width / e.arrangment.height,
						draggingPointType: undefined,
						dragEndPointType: e.dragPointType,
					}));

					onDiagramResizeEnd?.({
						id,
						point: e.arrangment.leftTopPoint,
						width: e.arrangment.width,
						height: e.arrangment.height,
					});
				},
				[onDiagramResizeEnd, id, _keepProportion],
			);

			/**
			 * ポインターダウンイベントハンドラ
			 *
			 * @param {DiagramPointerEvent} _e ポインターイベント
			 * @returns {void}
			 */
			const handlePointerDown = useCallback(
				(_e: DiagramPointerEvent) => {
					// 図形選択イベントを発火
					onDiagramSelect?.({
						id,
					});
				},
				[id, onDiagramSelect],
			);

			// シフトキーの状態を監視
			useEffect(() => {
				let handleKeyDown: (e: KeyboardEvent) => void;
				let handleKeyUp: (e: KeyboardEvent) => void;
				if (isSelected) {
					handleKeyDown = (e: KeyboardEvent) => {
						setShiftKeyDown(e.shiftKey);
					};
					handleKeyUp = (e: KeyboardEvent) => {
						if (e.key === "Shift") {
							setShiftKeyDown(false);
						}
					};

					window.addEventListener("keydown", handleKeyDown);
					window.addEventListener("keyup", handleKeyUp);
				}

				return () => {
					// クリーンアップ
					if (isSelected) {
						window.removeEventListener("keydown", handleKeyDown);
						window.removeEventListener("keyup", handleKeyUp);
					}
				};
			}, [isSelected]);

			return (
				<>
					<Draggable
						id={id}
						point={state.point}
						tabIndex={tabIndex}
						onPointerDown={handlePointerDown}
						onClick={onDiagramClick}
						onDragStart={onDragStart}
						onDrag={onDrag}
						onDragEnd={onDragEnd}
						ref={draggableRef}
					>
						{children}
						{isSelected && (
							// アウトライン用の四角形
							<rect
								x={0}
								y={0}
								width={width}
								height={height}
								fill="transparent"
								stroke="blue"
								strokeWidth="1px"
								strokeDasharray="3,3"
								pointerEvents={"none"}
								ref={outlineRef}
							/>
						)}
					</Draggable>
					{isSelected && !state.isDragging && (
						<>
							{/* 左上 */}
							<DragPointLeftTop
								{...state}
								id={id}
								keepProportion={_keepProportion}
								onArrangmentChangeStart={onArrangmentChangeStart}
								onArrangmentChange={onArrangmentChange}
								onArrangmentChangeEnd={onArrangmentChangeEnd}
							/>
							{/* 左下 */}
							<DragPointLeftBottom
								{...state}
								id={id}
								keepProportion={_keepProportion}
								onArrangmentChangeStart={onArrangmentChangeStart}
								onArrangmentChange={onArrangmentChange}
								onArrangmentChangeEnd={onArrangmentChangeEnd}
							/>
							{/* 右上 */}
							<DragPointRightTop
								{...state}
								id={id}
								keepProportion={_keepProportion}
								onArrangmentChangeStart={onArrangmentChangeStart}
								onArrangmentChange={onArrangmentChange}
								onArrangmentChangeEnd={onArrangmentChangeEnd}
							/>
							{/* 右下 */}
							<DragPointRightBottom
								{...state}
								id={id}
								keepProportion={_keepProportion}
								onArrangmentChangeStart={onArrangmentChangeStart}
								onArrangmentChange={onArrangmentChange}
								onArrangmentChangeEnd={onArrangmentChangeEnd}
							/>
							{/* 上中央 */}
							<DragPointTopCenter
								{...state}
								id={id}
								keepProportion={_keepProportion}
								onArrangmentChangeStart={onArrangmentChangeStart}
								onArrangmentChange={onArrangmentChange}
								onArrangmentChangeEnd={onArrangmentChangeEnd}
							/>
							{/* 左中央 */}
							<DragPointLeftCenter
								{...state}
								id={id}
								keepProportion={_keepProportion}
								onArrangmentChangeStart={onArrangmentChangeStart}
								onArrangmentChange={onArrangmentChange}
								onArrangmentChangeEnd={onArrangmentChangeEnd}
							/>
							{/* 右中央 */}
							<DragPointRightCenter
								{...state}
								id={id}
								keepProportion={_keepProportion}
								onArrangmentChangeStart={onArrangmentChangeStart}
								onArrangmentChange={onArrangmentChange}
								onArrangmentChangeEnd={onArrangmentChangeEnd}
							/>
							{/* 下中央 */}
							<DragPointBottomCenter
								{...state}
								id={id}
								keepProportion={_keepProportion}
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
