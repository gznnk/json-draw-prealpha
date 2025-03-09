// Reactのインポート
import type React from "react";
import { memo, useCallback, useRef, useState } from "react";

// SvgCanvas関連コンポーネントをインポート
import DragPoint from "../core/DragPoint";

// SvgCanvas関連型定義をインポート
import type { Point } from "../../types/CoordinateTypes";
import type {
	Diagram,
	DiagramBaseProps,
	LineData,
} from "../../types/DiagramTypes";
import type {
	DiagramDragEvent,
	DiagramPointerEvent,
} from "../../types/EventTypes";

// SvgCanvas関連カスタムフックをインポート
import { useDraggable } from "../../hooks/draggableHooks";

// ユーティリティをインポート
// import { getLogger } from "../../../../../utils/Logger";

// const logger = getLogger("Line");

const createDValue = (items: Diagram[]) => {
	let d = "";
	for (let i = 0; i < items.length; i++) {
		const item = items[i];
		d += `${i === 0 ? "M" : "L"} ${item.point.x} ${item.point.y} `;
	}
	return d;
};

export type LineProps = DiagramBaseProps & LineData;

const Line: React.FC<LineProps> = ({
	id,
	point,
	fill = "none",
	stroke = "black",
	strokeWidth = "1px",
	isSelected = false,
	onDiagramClick,
	onDiagramDragStart,
	onDiagramDrag,
	onDiagramDragEnd,
	onDiagramSelect,
	items = [],
}) => {
	const [isDragging, setIsDragging] = useState(false);

	const startItems = useRef<Diagram[]>(items);

	const svgRef = useRef<SVGPathElement>({} as SVGPathElement);
	const dragSvgRef = useRef<SVGPathElement>({} as SVGPathElement);

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
			onDiagramDrag?.(e);
		},
		[onDiagramDrag],
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
		},
		[onDiagramDragEnd],
	);

	const handleDragStart = useCallback(
		(e: DiagramDragEvent) => {
			startItems.current = items;

			setIsDragging(true);
			onDiagramDragStart?.(e);
		},
		[onDiagramDragStart, items],
	);

	/**
	 * 線分のドラッグ中イベントハンドラ
	 *
	 * @param {DiagramDragEvent} e ドラッグ中イベント
	 * @returns {void}
	 */
	const handleDrag = useCallback(
		(e: DiagramDragEvent) => {
			// TODO: GroupChangeEventでやる

			const dx = e.endPoint.x - e.startPoint.x;
			const dy = e.endPoint.y - e.startPoint.y;
			for (const item of startItems.current) {
				const x = item.point.x + dx;
				const y = item.point.y + dy;
				onDiagramDrag?.({
					id: item.id,
					startPoint: item.point,
					endPoint: { x, y },
				});
			}

			onDiagramDrag?.(e);
		},
		[onDiagramDrag],
	);

	/**
	 * 線分のドラッグ完了イベントハンドラ
	 *
	 * @param {DiagramDragEvent} e ドラッグ完了イベント
	 * @returns {void}
	 */
	const handleDragEnd = useCallback(
		(e: DiagramDragEvent) => {
			// const dx = e.endPoint.x - e.startPoint.x;
			// const dy = e.endPoint.y - e.startPoint.y;
			// for (const item of items) {
			// 	const x = item.point.x + dx;
			// 	const y = item.point.y + dy;
			// 	onDiagramDragEnd?.({
			// 		id: item.id,
			// 		startPoint: item.point,
			// 		endPoint: { x, y },
			// 	});
			// }

			// onDiagramDragEnd?.({
			// 	id,
			// 	startPoint: e.startPoint,
			// 	endPoint: e.endPoint,
			// });

			// TODO: 最後のイベントで再トリガー

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

	const draggableProps = useDraggable({
		id,
		type: "Line",
		point,
		ref: dragSvgRef,
		onPointerDown: handlePointerDown,
		onClick: onDiagramClick,
		onDragStart: handleDragStart,
		onDrag: handleDrag,
		onDragEnd: handleDragEnd,
	});

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
			<path
				id={id}
				d={d}
				fill="none"
				stroke="transparent"
				strokeWidth={7}
				ref={dragSvgRef}
				{...draggableProps}
			/>
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
};

export default memo(Line);
