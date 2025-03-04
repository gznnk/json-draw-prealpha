// Reactのインポート
import type React from "react";
import {
	forwardRef,
	memo,
	useCallback,
	useEffect,
	useImperativeHandle,
	useMemo,
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

// SvgCanvas関連カスタムフックをインポート
import { useDraggable } from "../../../hooks/draggableHooks";

// RectangleBase関連型定義をインポート
import type {
	ArrangmentChangeEndEvent,
	ArrangmentChangeEvent,
	ArrangmentChangeStartEvent,
	RectangleBaseBox,
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
	calcNearestCircleIntersectionPoint,
	calculateAngle,
	degreesToRadians,
	radiansToDegrees,
} from "../../../functions/Math";
import { createSvgTransform } from "../../../functions/Svg";

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
				scaleX = 1,
				scaleY = 1,
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
				aspectRatio: width / height,
				isDragging: false,
			});
			const [isShiftKeyDown, setShiftKeyDown] = useState(false);

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
					aspectRatio: width / height,
				}));
			}, [id, width, height]);

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
							scaleX,
							scaleY,
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
					// setState((prevState) => ({
					// 	...prevState,
					// 	...e.arrangment,
					// 	aspectRatio: _keepProportion
					// 		? prevState.aspectRatio
					// 		: e.arrangment.width / e.arrangment.height,
					// 	draggingPointType: undefined,
					// 	dragEndPointType: e.dragPointType,
					// }));
					// onDiagramResizeEnd?.({
					// 	id,
					// 	point: e.arrangment.leftTopPoint,
					// 	width: e.arrangment.width,
					// 	height: e.arrangment.height,
					// });
				},
				[],
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

			const rotatePoint = affineTransformation(
				{ x: width / 2 + 20, y: 0 },
				1,
				1,
				degreesToRadians(rotation),
				point.x,
				point.y,
			);

			const handleResizing = useCallback(
				(e: RectangleBaseBox) => {
					// TODO: x, yの計算がおかしい
					//outlineRef.current?.setAttribute("x", `${-e.width + width / 2}`);
					//outlineRef.current?.setAttribute("y", `${-e.height + height / 2}`);
					outlineRef.current?.setAttribute("width", `${e.width}`);
					outlineRef.current?.setAttribute("height", `${e.height}`);
					outlineRef.current?.setAttribute(
						"transform",
						createSvgTransform(
							e.scaleX,
							e.scaleY,
							degreesToRadians(rotation),
							0,
							0,
						),
					);
				},
				[width, height, rotation],
			);

			const handleResizeEnd = useCallback(
				(e: RectangleBaseBox) => {
					onDiagramResizeEnd?.({
						id,
						...e,
					});
				},
				[onDiagramResizeEnd, id],
			);

			const vertices = useMemo(
				() =>
					calcRectangleVertices(point, width, height, rotation, scaleX, scaleY),
				[point, width, height, rotation, scaleX, scaleY],
			);

			const dragPointProps = {
				...vertices,
				id,
				point,
				width,
				height,
				rotation,
				scaleX,
				scaleY,
				keepProportion: isShiftKeyDown || keepProportion,
				onResizing: handleResizing,
				onResizeEnd: handleResizeEnd,
			};

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
								x={-width / 2}
								y={-height / 2}
								width={width}
								height={height}
								fill="transparent"
								stroke="blue"
								strokeWidth="1px"
								strokeDasharray="3,3"
								pointerEvents={"none"}
								transform={createSvgTransform(
									scaleX,
									scaleY,
									degreesToRadians(rotation),
									0,
									0,
								)}
								ref={outlineRef}
							/>
						)}
					</Draggable>
					{isSelected && !state.isDragging && (
						<>
							{/* 左上 */}
							<DragPointLeftTop
								{...dragPointProps}
								onArrangmentChangeStart={onArrangmentChangeStart}
								onArrangmentChange={onArrangmentChange}
								onArrangmentChangeEnd={onArrangmentChangeEnd}
							/>
							{/* 左下 */}
							<DragPointLeftBottom
								{...dragPointProps}
								onArrangmentChangeStart={onArrangmentChangeStart}
								onArrangmentChange={onArrangmentChange}
								onArrangmentChangeEnd={onArrangmentChangeEnd}
							/>
							{/* 右上 */}
							<DragPointRightTop
								{...dragPointProps}
								onArrangmentChangeStart={onArrangmentChangeStart}
								onArrangmentChange={onArrangmentChange}
								onArrangmentChangeEnd={onArrangmentChangeEnd}
							/>
							{/* 右下 */}
							<DragPointRightBottom
								{...dragPointProps}
								onArrangmentChangeStart={onArrangmentChangeStart}
								onArrangmentChange={onArrangmentChange}
								onArrangmentChangeEnd={onArrangmentChangeEnd}
							/>
							{/* 上中央 */}
							<DragPointTopCenter
								{...dragPointProps}
								onArrangmentChangeStart={onArrangmentChangeStart}
								onArrangmentChange={onArrangmentChange}
								onArrangmentChangeEnd={onArrangmentChangeEnd}
							/>
							{/* 左中央 */}
							<DragPointLeftCenter
								{...dragPointProps}
								onArrangmentChangeStart={onArrangmentChangeStart}
								onArrangmentChange={onArrangmentChange}
								onArrangmentChangeEnd={onArrangmentChangeEnd}
							/>
							{/* 右中央 */}
							<DragPointRightCenter
								{...dragPointProps}
								onArrangmentChangeStart={onArrangmentChangeStart}
								onArrangmentChange={onArrangmentChange}
								onArrangmentChangeEnd={onArrangmentChangeEnd}
							/>
							{/* 下中央 */}
							<DragPointBottomCenter
								{...dragPointProps}
								onArrangmentChangeStart={onArrangmentChangeStart}
								onArrangmentChange={onArrangmentChange}
								onArrangmentChangeEnd={onArrangmentChangeEnd}
							/>
							{/* 回転 */}
							<DragPoint
								id={`rotation-${id}`}
								point={rotatePoint}
								onDrag={(e) => {
									const angle = calculateAngle(point, e.endPoint);
									console.log(radiansToDegrees(angle));
									// onDiagramRotateEnd?.({
									// 	id,
									// 	rotation: radiansToDegrees(angle),
									// });
									outlineRef.current?.setAttribute(
										"transform",
										createSvgTransform(1, 1, angle, 0, 0),
									);
								}}
								onDragEnd={(e) => {
									const angle = calculateAngle(point, e.endPoint);
									onDiagramRotateEnd?.({
										id,
										rotation: radiansToDegrees(angle),
									});
								}}
								dragPositioningFunction={(p: Point) => {
									return calcNearestCircleIntersectionPoint(
										{ x: point.x, y: point.y },
										width / 2 + 20,
										p,
									);
								}}
							/>
						</>
					)}
				</>
			);
		},
	),
);

export default RectangleBase;
