// Reactのインポート
import type React from "react";
import { memo, useCallback, useEffect, useRef, useState } from "react";

// SvgCanvas関連コンポーネントをインポート
import DragPoint from "../core/DragPoint";
import Group from "./Group";

// SvgCanvas関連型定義をインポート
import type { Point } from "../../types/CoordinateTypes";
import type {
	Diagram,
	DiagramBaseProps,
	LineData,
	LinePointData,
	TransformativeProps,
} from "../../types/DiagramTypes";
import type {
	DiagramClickEvent,
	DiagramDragEvent,
	DiagramPointerEvent,
	GroupDataChangeEvent,
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

export type LineProps = DiagramBaseProps &
	TransformativeProps &
	LineData & {
		onGroupDataChange?: (e: GroupDataChangeEvent) => void; // TODO: 共通化
	};

const Line: React.FC<LineProps> = ({
	id,
	point,
	width,
	height,
	rotation,
	scaleX,
	scaleY,
	fill = "none",
	stroke = "black",
	strokeWidth = "1px",
	isSelected = false,
	onClick,
	onDragStart,
	onDrag,
	onDragEnd,
	onSelect,
	onTransform,
	onGroupDataChange,
	items = [],
}) => {
	const [isDragging, setIsDragging] = useState(false);
	const [isSequentialSelection, setIsSequentialSelection] = useState(false);
	const [isTransformMode, setIsTransformMode] = useState(false);

	const startItems = useRef<Diagram[]>(items);
	const dragSvgRef = useRef<SVGPathElement>({} as SVGPathElement);

	/**
	 * ポインターダウンイベントハンドラ
	 *
	 * @param {DiagramPointerEvent} e ポインターイベント
	 * @returns {void}
	 */
	const handlePointerDown = useCallback(
		(e: DiagramPointerEvent) => {
			// 図形選択イベントを発火
			onSelect?.({
				id,
			});

			if (isSelected) {
				setIsSequentialSelection(true);
			}
		},
		[onSelect, id, isSelected],
	);

	/**
	 * 図形クリックイベントハンドラ
	 *
	 * @param {DiagramClickEvent} e クリックイベント
	 * @returns {void}
	 */
	const handleClick = useCallback(
		(e: DiagramClickEvent) => {
			if (isSequentialSelection) {
				setIsTransformMode(!isTransformMode);
			}
			onClick?.({
				id,
			});
		},
		[onClick, id, isSequentialSelection, isTransformMode],
	);

	useEffect(() => {
		// グループから選択が外れたら連続選択フラグも解除
		if (!isSelected) {
			setIsSequentialSelection(false);
			setIsTransformMode(false);
		}
	}, [isSelected]);

	/**
	 * 線分のドラッグ開始イベントハンドラ
	 *
	 * @param {DiagramDragEvent} e ドラッグ開始イベント
	 * @returns {void}
	 */
	const handleDragStart = useCallback(
		(e: DiagramDragEvent) => {
			startItems.current = items;

			setIsDragging(true);
			onDragStart?.(e);
		},
		[onDragStart, items],
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

			const newItems = startItems.current.map((item) => {
				const x = item.point.x + dx;
				const y = item.point.y + dy;
				return { ...item, point: { x, y } };
			});

			onGroupDataChange?.({
				id,
				point: e.endPoint,
				items: newItems,
			});
		},
		[onGroupDataChange, id],
	);

	/**
	 * 線分のドラッグ完了イベントハンドラ
	 *
	 * @param {DiagramDragEvent} _e ドラッグ完了イベント
	 * @returns {void}
	 */
	const handleDragEnd = useCallback((_e: DiagramDragEvent) => {
		setIsDragging(false);
	}, []);

	const draggableProps = useDraggable({
		id,
		type: "Line",
		point,
		ref: dragSvgRef,
		onPointerDown: handlePointerDown,
		onClick: handleClick,
		onDragStart: handleDragStart,
		onDrag: handleDrag,
		onDragEnd: handleDragEnd,
	});

	/**
	 * ドラッグポイントのドラッグ開始イベントハンドラ
	 *
	 * @param {DiagramDragEvent} e ドラッグ開始イベント
	 * @returns {void}
	 */
	const handleLinePointDragStart = useCallback(
		(e: DiagramDragEvent) => {
			onDragStart?.(e);
		},
		[onDragStart],
	);

	/**
	 * ドラッグポイントのドラッグ中イベントハンドラ
	 *
	 * @param {DiagramDragEvent} e ドラッグ中イベント
	 * @returns {void}
	 */
	const handleLinePointDrag = useCallback(
		(e: DiagramDragEvent) => {
			onDrag?.(e);
		},
		[onDrag],
	);

	/**
	 * ドラッグポイントのドラッグ完了イベントハンドラ
	 *
	 * @param {DiagramDragEvent} e ドラッグ完了イベント
	 * @returns {void}
	 */
	const handleLinePointDragEnd = useCallback(
		(e: DiagramDragEvent) => {
			onDragEnd?.(e);
		},
		[onDragEnd],
	);

	// 線分のd属性値を生成
	const d = createDValue(items);

	const linePoints = items.map((item) => ({
		...item,
		isActive: !isTransformMode,
	}));

	return (
		<>
			{/* 描画用のパス */}
			<g transform="translate(0.5,0.5)">
				<path d={d} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
			</g>
			{/* ドラッグ用のパス */}
			<path
				id={id}
				d={d}
				fill="none"
				stroke="transparent"
				strokeWidth={7}
				tabIndex={0}
				ref={dragSvgRef}
				{...draggableProps}
			/>
			{/* 変形用グループ */}
			{isSelected && (
				<Group
					id={id}
					point={point}
					isSelected={isTransformMode}
					width={width}
					height={height}
					rotation={rotation}
					scaleX={scaleX}
					scaleY={scaleY}
					keepProportion={false}
					items={linePoints}
					isTransformActive={isTransformMode}
					onDragStart={handleLinePointDragStart}
					onDrag={handleLinePointDrag}
					onDragEnd={handleLinePointDragEnd}
					onTransform={onTransform}
					onGroupDataChange={onGroupDataChange}
				/>
			)}
		</>
	);
};

export default memo(Line);

type LinePointProps = DiagramBaseProps & LinePointData;

export const LinePoint: React.FC<LinePointProps> = memo(
	({ id, point, isActive = true, onDragStart, onDrag, onDragEnd }) => {
		if (!isActive) {
			return null;
		}

		return (
			<DragPoint
				id={id}
				point={point}
				onDragStart={onDragStart}
				onDrag={onDrag}
				onDragEnd={onDragEnd}
			/>
		);
	},
);
