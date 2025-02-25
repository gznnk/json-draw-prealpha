import type React from "react";
import {
	useState,
	useCallback,
	useRef,
	forwardRef,
	memo,
	useImperativeHandle,
} from "react";
import Draggable from "../core/Draggable";
import DragPoint from "../core/DragPoint";
import type { Point } from "../../types/CoordinateTypes";
import type {
	DiagramDragEvent,
	DiagramPointerEvent,
	GroupDragEvent,
	GroupResizeEvent,
} from "../../types/EventTypes";
import type {
	Diagram,
	DiagramRef,
	DiagramBaseProps,
	LineData,
} from "../../types/DiagramTypes";

// ユーティリティをインポート
import { getLogger } from "../../../../../utils/Logger";

// RectangleBase関連関数をインポート
import { calcArrangmentOnGroupResize } from "../core/RectangleBase/RectangleBaseFunctions";

const logger = getLogger("Line");

const createDValue = (
	items: Diagram[],
	originPoint: Point = { x: 0, y: 0 },
) => {
	let d = "";
	for (let i = 0; i < items.length; i++) {
		const item = items[i];
		d += `${i === 0 ? "M" : "L"} ${item.point.x - originPoint.x} ${item.point.y - originPoint.y} `;
	}
	return d;
};

export type LineProps = DiagramBaseProps & LineData;

const Line: React.FC<LineProps> = memo(
	forwardRef<DiagramRef, LineProps>(
		(
			{
				id,
				point,
				width,
				height,
				fill = "none",
				stroke = "black",
				strokeWidth = "1px",
				isSelected = false,
				onDiagramClick,
				onDiagramDragStart,
				onDiagramDrag,
				onDiagramDragEnd,
				onDiagramDragEndByGroup,
				onDiagramResizeEnd,
				onDiagramSelect,
				items = [],
			},
			ref,
		) => {
			const [isDragging, setIsDragging] = useState(false);

			const svgRef = useRef<SVGPathElement>({} as SVGPathElement);
			const dragSvgRef = useRef<SVGPathElement>({} as SVGPathElement);

			// 親グループのドラッグ・リサイズ時に、親グループ側から実行してもらう関数を公開
			useImperativeHandle(ref, () => ({
				onGroupDrag: handleGroupDrag,
				onGroupDragEnd: handleGroupDragEnd,
				onGroupResize: onGroupResize,
				onGroupResizeEnd: onGroupResizeEnd,
			}));

			/**
			 * グループのドラッグ中イベントハンドラ
			 *
			 * @param {GroupDragEvent} e グループのドラッグ中イベント
			 * @returns {void}
			 */
			const handleGroupDrag = useCallback(
				(e: GroupDragEvent) => {
					// グループのドラッグに伴うこの図形の座標を計算
					const dx = e.endPoint.x - e.startPoint.x;
					const dy = e.endPoint.y - e.startPoint.y;

					// 描画処理負荷軽減のため、DOMを直接操作
					// 短径領域の移動をDOMの直接操作で実施
					const d = createDValue(items, {
						x: -dx,
						y: -dy,
					});

					svgRef.current.setAttribute("d", d);
				},
				[items],
			);

			/**
			 * グループのドラッグ完了イベントハンドラ
			 *
			 * @param {GroupDragEvent} e グループのドラッグ完了イベント
			 * @returns {void}
			 */
			const handleGroupDragEnd = useCallback(
				(e: GroupDragEvent) => {
					const dx = e.endPoint.x - e.startPoint.x;
					const dy = e.endPoint.y - e.startPoint.y;

					// グループのドラッグ完了に伴うこの図形の位置変更をグループ側に通知し、SvgCanvasまで変更を伝番してもらう
					onDiagramDragEndByGroup?.({
						id,
						startPoint: point,
						endPoint: {
							x: point.x + dx,
							y: point.y + dy,
						},
					});

					// ドラッグポイントの位置変更も通知
					for (const item of items) {
						const x = item.point.x + dx;
						const y = item.point.y + dy;
						onDiagramDragEndByGroup?.({
							id: item.id,
							startPoint: item.point,
							endPoint: { x, y },
						});
					}
				},
				[onDiagramDragEndByGroup, id, point, items],
			);

			/**
			 * グループのリサイズ中イベントハンドラ
			 *
			 * @param {GroupResizeEvent} e グループのリサイズ中イベント
			 * @returns {void}
			 */
			const onGroupResize = useCallback(
				(e: GroupResizeEvent) => {
					// グループのリサイズに伴うこの図形の変更を計算
					const newArrangment = calcArrangmentOnGroupResize(
						e,
						point,
						width,
						height,
					);

					// 描画処理負荷軽減のため、DOMを直接操作
					// 短径領域の移動をDOMの直接操作で実施
					const scaleX = e.endSize.width / e.startSize.width;
					const scaleY = e.endSize.height / e.startSize.height;
					const newItems = items.map((item) => {
						const relativeX = item.point.x - point.x;
						const relativeY = item.point.y - point.y;
						const x = newArrangment.point.x + Math.round(relativeX * scaleX);
						const y = newArrangment.point.y + Math.round(relativeY * scaleY);

						return {
							...item,
							point: {
								x,
								y,
							},
						};
					});
					const d = createDValue(newItems);
					svgRef.current.setAttribute("d", d);

					// グループのリサイズが契機で、かつDOMを直接更新しての変更なので、グループ側への変更通知はしない
				},
				[point, width, height, items],
			);

			/**
			 * グループのリサイズ完了イベントハンドラ
			 *
			 * @param {GroupResizeEvent} e グループのリサイズ完了イベント
			 */
			const onGroupResizeEnd = useCallback(
				(e: GroupResizeEvent) => {
					// グループのリサイズに伴うこの図形のリサイズ後の座標とサイズを計算
					const newArrangment = calcArrangmentOnGroupResize(
						e,
						point,
						width,
						height,
					);

					onDiagramResizeEnd?.({
						id,
						...newArrangment,
					});

					// ドラッグポイントの位置変更も通知
					const scaleX = e.endSize.width / e.startSize.width;
					const scaleY = e.endSize.height / e.startSize.height;
					items.map((item) => {
						const relativeX = item.point.x - point.x;
						const relativeY = item.point.y - point.y;
						const x = newArrangment.point.x + Math.round(relativeX * scaleX);
						const y = newArrangment.point.y + Math.round(relativeY * scaleY);

						onDiagramResizeEnd?.({
							id: item.id,
							point: {
								x,
								y,
							},
							width: item.width,
							height: item.height,
						});
					});
				},
				[onDiagramResizeEnd, id, point, width, height, items],
			);

			/**
			 * ドラッグポイントのドラッグ開始イベントハンドラ
			 *
			 * @param {DiagramDragEvent} e ドラッグ開始イベント
			 * @returns {void}
			 */
			const handleDragPointDragStart = useCallback(
				(e: DiagramDragEvent) => {
					onDiagramDragStart?.(e);
				},
				[onDiagramDragStart],
			);

			/**
			 * ドラッグポイントのドラッグ中イベントハンドラ
			 *
			 * @param {DiagramDragEvent} e ドラッグ中イベント
			 * @returns {void}
			 */
			const handleDragPointDrag = useCallback(
				(e: DiagramDragEvent) => {
					let d = "";
					for (let i = 0; i < items.length; i++) {
						const item = items[i];
						const x = item.id === e.id ? e.endPoint.x : item.point.x;
						const y = item.id === e.id ? e.endPoint.y : item.point.y;
						if (i === 0) {
							d += `M ${x} ${y} `;
						} else {
							d += `L ${x} ${y} `;
						}
					}
					svgRef.current.setAttribute("d", d);

					onDiagramDrag?.(e);
				},
				[items, onDiagramDrag],
			);

			/**
			 * ドラッグポイントのドラッグ完了イベントハンドラ
			 *
			 * @param {DiagramDragEvent} e ドラッグ完了イベント
			 * @returns {void}
			 */
			const handleDragPointDragEnd = useCallback(
				(e: DiagramDragEvent) => {
					onDiagramDragEnd?.(e);

					let top = Number.POSITIVE_INFINITY;
					let left = Number.POSITIVE_INFINITY;
					let bottom = Number.NEGATIVE_INFINITY;
					let right = Number.NEGATIVE_INFINITY;
					for (const item of items) {
						const i =
							item.id === e.id
								? {
										point: {
											x: e.endPoint.x,
											y: e.endPoint.y,
										},
									}
								: item;
						top = Math.min(top, i.point.y);
						left = Math.min(left, i.point.x);
						bottom = Math.max(bottom, i.point.y);
						right = Math.max(right, i.point.x);
					}

					onDiagramResizeEnd?.({
						id,
						point: { x: left, y: top },
						width: right - left,
						height: bottom - top,
					});
				},
				[onDiagramDragEnd, onDiagramResizeEnd, id, items],
			);

			const handleDragStart = useCallback(
				(e: DiagramDragEvent) => {
					setIsDragging(true);
					onDiagramDragStart?.(e);
				},
				[onDiagramDragStart],
			);

			/**
			 * 線分のドラッグ中イベントハンドラ
			 *
			 * @param {DiagramDragEvent} e ドラッグ中イベント
			 * @returns {void}
			 */
			const handleDrag = useCallback(
				(e: DiagramDragEvent) => {
					const dx = e.endPoint.x - e.startPoint.x;
					const dy = e.endPoint.y - e.startPoint.y;

					const d = createDValue(items, {
						x: -dx,
						y: -dy,
					});

					svgRef.current.setAttribute("d", d);

					onDiagramDrag?.(e);
				},
				[onDiagramDrag, items],
			);

			/**
			 * 線分のドラッグ完了イベントハンドラ
			 *
			 * @param {DiagramDragEvent} e ドラッグ完了イベント
			 * @returns {void}
			 */
			const handleDragEnd = useCallback(
				(e: DiagramDragEvent) => {
					const dx = e.endPoint.x - e.startPoint.x;
					const dy = e.endPoint.y - e.startPoint.y;
					for (const item of items) {
						const x = item.point.x + dx;
						const y = item.point.y + dy;
						onDiagramDragEnd?.({
							id: item.id,
							startPoint: item.point,
							endPoint: { x, y },
						});
					}

					onDiagramDragEnd?.({
						id,
						startPoint: e.startPoint,
						endPoint: e.endPoint,
					});

					setIsDragging(false);
				},
				[id, items, onDiagramDragEnd],
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

			// 描画用のパスのd属性値を生成
			const d = createDValue(items);
			// ドラッグ用のパスのd属性値を生成
			const dragD = createDValue(items, point);

			return (
				<>
					{/* 描画用のパス */}
					<path
						d={d}
						fill={fill}
						stroke={stroke}
						strokeWidth={strokeWidth}
						ref={svgRef}
					/>
					{/* ドラッグ用のパス */}
					<Draggable
						id={id}
						point={point}
						onPointerDown={handlePointerDown}
						onClick={onDiagramClick}
						onDragStart={handleDragStart}
						onDrag={handleDrag}
						onDragEnd={handleDragEnd}
					>
						<path
							id={id}
							d={dragD}
							fill="none"
							stroke="transparent"
							strokeWidth={7}
							ref={dragSvgRef}
						/>
					</Draggable>
					{/* ドラッグポイント */}
					{isSelected &&
						!isDragging &&
						items.map((item) => {
							return (
								<DragPoint
									key={item.id}
									id={item.id}
									point={item.point}
									onDragStart={handleDragPointDragStart}
									onDrag={handleDragPointDrag}
									onDragEnd={handleDragPointDragEnd}
								/>
							);
						})}
				</>
			);
		},
	),
);

export default Line;
