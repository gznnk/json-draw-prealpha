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
import type {
	DiagramBaseProps,
	RectangleBaseData,
} from "../../../types/DiagramTypes";
import type {
	DiagramDragEvent,
	DiagramPointerEvent,
} from "../../../types/EventTypes";

// SvgCanvas関連コンポーネントをインポート
import Draggable from "../Draggable";
import DragPoint from "../DragPoint";

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
import { calcRectangleVertices } from "./RectangleBaseFunctions";

import {
	affineTransformation,
	degreesToRadians,
	radiansToDegrees,
	calculateAngle,
	calcNearestCircleIntersectionPoint,
} from "../../../functions/Math";

export type RectangleBaseProps = DiagramBaseProps &
	RectangleBaseData & {
		tabIndex?: number;
		children?: React.ReactNode;
		ref?: React.Ref<SVGGElement>;
	};

const RectangleBase: React.FC<RectangleBaseProps> = memo(
	forwardRef<SVGGElement, RectangleBaseProps>(
		(
			{
				id,
				type,
				point,
				width,
				height,
				rotation,
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
				onDiagramRotateEnd,
				onDiagramSelect,
				onDiagramHoverChange,
				children,
			},
			ref,
		) => {
			const [state, setState] = useState<RectangleBaseState>({
				...calcRectangleVertices(point, width, height, rotation),
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
					...calcRectangleVertices(point, width, height, rotation),
					aspectRatio: width / height,
				}));
			}, [id, point, width, height, rotation]);

			/**
			 * ドラッグ開始イベントハンドラ
			 *
			 * @param {DiagramDragEvent} e ドラッグイベント
			 * @returns {void}
			 */
			const handleDragStart = useCallback(
				(e: DiagramDragEvent) => {
					// 親にドラッグ開始イベントを通知
					onDiagramDragStart?.({
						id,
						startPoint: e.startPoint,
						endPoint: e.endPoint,
					});

					// ドラッグ中フラグを立てる
					setState((prevState) => ({
						...prevState,
						isDragging: true,
						dragEndPointType: undefined,
					}));
				},
				[onDiagramDragStart, id],
			);

			/**
			 * ドラッグ中イベントハンドラ
			 *
			 * @param {DiagramDragEvent} e ドラッグイベント
			 * @returns {void}
			 */
			const handleDrag = useCallback(
				(e: DiagramDragEvent) => {
					// 親にドラッグ中イベントを通知
					onDiagramDrag?.({
						id,
						startPoint: e.startPoint,
						endPoint: e.endPoint,
					});
				},
				[onDiagramDrag, id],
			);

			/**
			 * ドラッグ終了イベントハンドラ
			 *
			 * @param {DiagramDragEvent} e ドラッグイベント
			 * @returns {void}
			 */
			const handleDragEnd = useCallback(
				(e: DiagramDragEvent) => {
					// 移動量算出
					const dx = e.endPoint.x - e.startPoint.x;
					const dy = e.endPoint.y - e.startPoint.y;
					// ドラッグポイントの位置を更新
					setState((prevState) => ({
						...prevState,
						...calcRectangleVertices(
							{
								x: point.x + dx,
								y: point.y + dy,
							},
							width,
							height,
							rotation,
						),
						isDragging: false,
					}));

					// 親にドラッグ終了イベントを通知
					onDiagramDragEnd?.({
						id,
						startPoint: e.startPoint,
						endPoint: e.endPoint,
					});
				},
				[onDiagramDragEnd, id, point, width, height, rotation],
			);

			// --- 以下点のドラッグ ---

			const onArrangmentChangeStart = useCallback(
				(e: ArrangmentChangeStartEvent) => {
					onDiagramResizeStart?.({
						id,
						point,
						width,
						height,
					});

					setState((prevState) => ({
						...prevState,
						draggingPointType: e.dragPointType,
					}));
				},
				[onDiagramResizeStart, id, point, width, height],
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
					if (!isSelected) {
						// 図形選択イベントを発火
						onDiagramSelect?.({
							id,
						});
					}
				},
				[id, isSelected, onDiagramSelect],
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

			const handleRotateLeft = () => {
				onDiagramRotateEnd?.({ id, rotation: (rotation ?? 0) + 15 });
			};

			const rotatePoint = affineTransformation(
				{ x: width / 2 + 20, y: 0 },
				1,
				1,
				degreesToRadians(rotation),
				point.x + width / 2,
				point.y + height / 2,
			);

			return (
				<>
					<Draggable
						id={id}
						type={type}
						point={point}
						tabIndex={tabIndex}
						onPointerDown={handlePointerDown}
						onClick={onDiagramClick}
						onDragStart={handleDragStart}
						onDrag={handleDrag}
						onDragEnd={handleDragEnd}
						onHoverChange={onDiagramHoverChange}
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
								transform={`rotate(${rotation}, ${width / 2}, ${height / 2})`}
								ref={outlineRef}
							/>
						)}
					</Draggable>
					{isSelected && !state.isDragging && (
						<>
							{/* 左上 */}
							<DragPointLeftTop
								{...state}
								point={point}
								width={width}
								height={height}
								rotation={rotation}
								id={id}
								keepProportion={_keepProportion}
								onArrangmentChangeStart={onArrangmentChangeStart}
								onArrangmentChange={onArrangmentChange}
								onArrangmentChangeEnd={onArrangmentChangeEnd}
							/>
							{/* 左下 */}
							<DragPointLeftBottom
								{...state}
								point={point}
								width={width}
								height={height}
								rotation={rotation}
								id={id}
								keepProportion={_keepProportion}
								onArrangmentChangeStart={onArrangmentChangeStart}
								onArrangmentChange={onArrangmentChange}
								onArrangmentChangeEnd={onArrangmentChangeEnd}
							/>
							{/* 右上 */}
							<DragPointRightTop
								{...state}
								point={point}
								width={width}
								height={height}
								rotation={rotation}
								id={id}
								keepProportion={_keepProportion}
								onArrangmentChangeStart={onArrangmentChangeStart}
								onArrangmentChange={onArrangmentChange}
								onArrangmentChangeEnd={onArrangmentChangeEnd}
							/>
							{/* 右下 */}
							<DragPointRightBottom
								{...state}
								point={point}
								width={width}
								height={height}
								rotation={rotation}
								id={id}
								keepProportion={_keepProportion}
								onArrangmentChangeStart={onArrangmentChangeStart}
								onArrangmentChange={onArrangmentChange}
								onArrangmentChangeEnd={onArrangmentChangeEnd}
							/>
							{/* 上中央 */}
							<DragPointTopCenter
								{...state}
								point={point}
								width={width}
								height={height}
								rotation={rotation}
								id={id}
								keepProportion={_keepProportion}
								onArrangmentChangeStart={onArrangmentChangeStart}
								onArrangmentChange={onArrangmentChange}
								onArrangmentChangeEnd={onArrangmentChangeEnd}
							/>
							{/* 左中央 */}
							<DragPointLeftCenter
								{...state}
								point={point}
								width={width}
								height={height}
								rotation={rotation}
								id={id}
								keepProportion={_keepProportion}
								onArrangmentChangeStart={onArrangmentChangeStart}
								onArrangmentChange={onArrangmentChange}
								onArrangmentChangeEnd={onArrangmentChangeEnd}
							/>
							{/* 右中央 */}
							<DragPointRightCenter
								{...state}
								point={point}
								width={width}
								height={height}
								rotation={rotation}
								id={id}
								keepProportion={_keepProportion}
								onArrangmentChangeStart={onArrangmentChangeStart}
								onArrangmentChange={onArrangmentChange}
								onArrangmentChangeEnd={onArrangmentChangeEnd}
							/>
							{/* 下中央 */}
							<DragPointBottomCenter
								{...state}
								point={point}
								width={width}
								height={height}
								rotation={rotation}
								id={id}
								keepProportion={_keepProportion}
								onArrangmentChangeStart={onArrangmentChangeStart}
								onArrangmentChange={onArrangmentChange}
								onArrangmentChangeEnd={onArrangmentChangeEnd}
							/>
							{/* 回転 */}
							<DragPoint
								id={`rotation-${id}`}
								point={rotatePoint}
								onDrag={(e) => {
									const center = {
										x: point.x + width / 2,
										y: point.y + height / 2,
									};
									const angle = calculateAngle(center, e.endPoint);
									console.log(radiansToDegrees(angle));
									// onDiagramRotateEnd?.({
									// 	id,
									// 	rotation: radiansToDegrees(angle),
									// });
									outlineRef.current?.setAttribute(
										"transform",
										`rotate(${radiansToDegrees(angle)}, ${width / 2}, ${height / 2})`,
									);
								}}
								onDragEnd={(e) => {
									const center = {
										x: point.x + width / 2,
										y: point.y + height / 2,
									};
									const angle = calculateAngle(center, e.endPoint);
									onDiagramRotateEnd?.({
										id,
										rotation: radiansToDegrees(angle),
									});
								}}
								dragPositioningFunction={(p: Point) => {
									return calcNearestCircleIntersectionPoint(
										{ x: point.x + width / 2, y: point.y + height / 2 },
										width / 2 + 20,
										p,
									);
								}}
							/>
							<path
								d={`M${point.x + width / 2} ${point.y + height / 2} L${rotatePoint.x} ${rotatePoint.y}`}
								stroke="red"
								strokeWidth="1"
								pointerEvents="none"
							/>
						</>
					)}
					{/* Rotation buttons */}
					<rect
						x={point.x}
						y={point.y}
						width={20}
						height={20}
						fill="red"
						onPointerDown={handleRotateLeft}
					>
						Rotate Left
					</rect>
				</>
			);
		},
	),
);

export default RectangleBase;
