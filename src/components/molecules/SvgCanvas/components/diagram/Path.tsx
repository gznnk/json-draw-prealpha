// Reactのインポート
import type React from "react";
import { memo, useCallback, useEffect, useRef, useState } from "react";

// SvgCanvas関連コンポーネントをインポート
import DragLine from "../core/DragLine";
import DragPoint from "../core/DragPoint";
import Group from "./Group";

// SvgCanvas関連型定義をインポート
import type { Point } from "../../types/CoordinateTypes";
import type {
	CreateDiagramProps,
	Diagram,
	PathData,
	PathPointData,
} from "../../types/DiagramTypes";
import type {
	DiagramClickEvent,
	DiagramDragEvent,
	DiagramPointerEvent,
	ItemableChangeEvent,
} from "../../types/EventTypes";

// SvgCanvas関連カスタムフックをインポート
import { useDrag } from "../../hooks/dragHooks";

// SvgCanvas関連関数をインポート
import { getCursorFromAngle, newId } from "../../functions/Diagram";
import {
	calcPointsOuterBox, // TODO: 回転時にずれるので要修正
	calcRadians,
	createLinerX2yFunction,
	createLinerY2xFunction,
	radiansToDegrees,
	rotatePoint,
} from "../../functions/Math";

const createDValue = (items: Diagram[]) => {
	let d = "";
	for (let i = 0; i < items.length; i++) {
		const item = items[i];
		d += `${i === 0 ? "M" : "L"} ${item.x} ${item.y} `;
	}
	return d;
};

/**
 * 折れ線コンポーネントのプロパティ
 */
export type PathProps = CreateDiagramProps<
	PathData,
	{
		selectable: true;
		transformative: true;
		itemable: true;
	}
> & {
	dragEnabled?: boolean;
	transformEnabled?: boolean;
	segmentDragEnabled?: boolean;
	newVertexEnabled?: boolean;
};

/**
 * 折れ線コンポーネント.
 * できること：
 * - 折れ線の描画
 * - 折れ線の全体ドラッグ
 * - 折れ線の選択
 * - 折れ線の変形
 * - 折れ線の線分のドラッグ
 * - 折れ線の新規頂点の追加
 */
const Path: React.FC<PathProps> = ({
	id,
	x,
	y,
	width,
	height,
	rotation,
	scaleX,
	scaleY,
	keepProportion = false,
	stroke = "black",
	strokeWidth = "1px",
	isSelected = false,
	dragEnabled = true,
	transformEnabled = true,
	segmentDragEnabled = true,
	newVertexEnabled = true,
	onClick,
	onDragStart,
	onDrag,
	onDragEnd,
	onSelect,
	onTransform,
	onItemableChange,
	items = [],
}) => {
	const [isDragging, setIsDragging] = useState(false);
	const [isPathPointDragging, setIsPathPointDragging] = useState(false);
	const [isSequentialSelection, setIsSequentialSelection] = useState(false);
	const [isTransformMode, setIsTransformMode] = useState(false);

	const startItems = useRef<Diagram[]>(items);
	const dragSvgRef = useRef<SVGPathElement>({} as SVGPathElement);

	/**
	 * 折れ線のポインターダウンイベントハンドラ
	 */
	const handlePointerDown = useCallback(
		(_e: DiagramPointerEvent) => {
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
	 * 折れ線のクリックイベントハンドラ
	 */
	const handleClick = useCallback(
		(_e: DiagramClickEvent) => {
			if (isSequentialSelection && transformEnabled) {
				setIsTransformMode(!isTransformMode);
			}
			onClick?.({
				id,
			});
		},
		[onClick, id, transformEnabled, isSequentialSelection, isTransformMode],
	);

	// 折れ線の選択状態制御
	useEffect(() => {
		// グループから選択が外れたら連続選択フラグも解除
		if (!isSelected) {
			setIsSequentialSelection(false);
			setIsTransformMode(false);
		}
	}, [isSelected]);

	/**
	 * 折れ線のドラッグ開始イベントハンドラ
	 */
	const handleDragStart = useCallback(
		(e: DiagramDragEvent) => {
			if (!dragEnabled) {
				return;
			}

			if (isSelected) {
				setIsDragging(true);
			}

			onDragStart?.(e);

			startItems.current = items;
		},
		[onDragStart, isSelected, dragEnabled, items],
	);

	/**
	 * 折れ線のドラッグ中イベントハンドラ
	 */
	const handleDrag = useCallback(
		(e: DiagramDragEvent) => {
			if (!dragEnabled) {
				return;
			}

			if (!isDragging) {
				onDrag?.(e);
				return;
			}

			const dx = e.endX - e.startX;
			const dy = e.endY - e.startY;

			const newItems = startItems.current.map((item) => {
				const x = item.x + dx;
				const y = item.y + dy;
				return { ...item, x, y };
			});

			onItemableChange?.({
				type: e.eventType,
				id,
				x: e.endX,
				y: e.endY,
				items: newItems,
			});
		},
		[onDrag, onItemableChange, id, dragEnabled, isDragging],
	);

	/**
	 * 折れ線のドラッグ完了イベントハンドラ
	 */
	const handleDragEnd = useCallback((_e: DiagramDragEvent) => {
		setIsDragging(false);
	}, []);

	// 折れ線のドラッグ用要素のプロパティ生成
	const dragProps = useDrag({
		id,
		type: "Path",
		x,
		y,
		ref: dragSvgRef,
		onPointerDown: handlePointerDown,
		onClick: handleClick,
		onDragStart: handleDragStart,
		onDrag: handleDrag,
		onDragEnd: handleDragEnd,
	});

	/**
	 * 頂点のドラッグ開始イベントハンドラ
	 */
	const handlePathPointDragStart = useCallback(
		(e: DiagramDragEvent) => {
			setIsPathPointDragging(true);
			onDragStart?.(e);
		},
		[onDragStart],
	);

	/**
	 * 頂点のドラッグ中イベントハンドラ
	 */
	const handlePathPointDrag = useCallback(
		(e: DiagramDragEvent) => {
			onDrag?.(e);
		},
		[onDrag],
	);

	/**
	 * 頂点のドラッグ完了イベントハンドラ
	 */
	const handlePathPointDragEnd = useCallback(
		(e: DiagramDragEvent) => {
			setIsPathPointDragging(false);
			onDragEnd?.(e);
		},
		[onDragEnd],
	);

	// 折れ線のd属性値を生成
	const d = createDValue(items);

	// 頂点情報を生成
	const linePoints = items.map((item, idx) => ({
		...item,
		hidden: isTransformMode || isDragging,
		pointerEventsDisabled: idx === 0 || idx === items.length - 1, // TODO: 接続ポイントの場合のみにする
	}));

	return (
		<>
			{/* 描画用のパス */}
			<g transform="translate(0.5,0.5)">
				<path d={d} fill="none" stroke={stroke} strokeWidth={strokeWidth} />
			</g>
			{/* ドラッグ用のパス */}
			<path
				id={id}
				d={d}
				fill="none"
				stroke="transparent"
				strokeWidth={7}
				cursor={dragEnabled ? "move" : "default"}
				tabIndex={0}
				ref={dragSvgRef}
				{...dragProps}
			/>
			{/* 線分ドラッグ */}
			{segmentDragEnabled &&
				isSelected &&
				!isTransformMode &&
				!isPathPointDragging && (
					<SegmentList
						id={id}
						items={items}
						onPointerDown={handlePointerDown}
						onClick={handleClick}
						onItemableChange={onItemableChange}
					/>
				)}
			{/* 新規頂点 */}
			{newVertexEnabled &&
				isSelected &&
				!isTransformMode &&
				!isPathPointDragging && (
					<NewVertexList
						id={id}
						items={items}
						onItemableChange={onItemableChange}
					/>
				)}
			{/* 変形用グループ */}
			{isSelected && (
				<Group
					id={id}
					x={x}
					y={y}
					isSelected={transformEnabled && isTransformMode}
					width={width}
					height={height}
					rotation={rotation}
					scaleX={scaleX}
					scaleY={scaleY}
					keepProportion={keepProportion}
					items={linePoints}
					onDragStart={handlePathPointDragStart}
					onDrag={handlePathPointDrag}
					onDragEnd={handlePathPointDragEnd}
					onTransform={onTransform}
					onItemableChange={onItemableChange}
				/>
			)}
		</>
	);
};

export default memo(Path);

/**
 * 折れ線の頂点プロパティ
 */
type PathPointProps = CreateDiagramProps<PathPointData, object>;

/**
 * 折れ線の頂点コンポーネント
 */
export const PathPoint: React.FC<PathPointProps> = memo(
	({
		id,
		x,
		y,
		hidden,
		pointerEventsDisabled,
		onDragStart,
		onDrag,
		onDragEnd,
	}) => {
		return (
			<DragPoint
				id={id}
				x={x}
				y={y}
				hidden={hidden}
				pointerEventsDisabled={pointerEventsDisabled}
				onDragStart={onDragStart}
				onDrag={onDrag}
				onDragEnd={onDragEnd}
			/>
		);
	},
);
PathPoint.displayName = "PathPoint";

/**
 * 新規頂点データ
 */
type NewVertexData = {
	id: string;
	x: number;
	y: number;
};

/**
 * 新規頂点プロパティ
 */
type NewVertexProps = NewVertexData & {
	onDragStart?: (e: DiagramDragEvent) => void;
	onDrag?: (e: DiagramDragEvent) => void;
	onDragEnd?: (e: DiagramDragEvent) => void;
};

/**
 * 新規頂点コンポーネント
 */
const NewVertex: React.FC<NewVertexProps> = memo(
	({ id, x, y, onDragStart, onDrag, onDragEnd }) => {
		return (
			<DragPoint
				id={id}
				x={x}
				y={y}
				fill="white"
				onDragStart={onDragStart}
				onDrag={onDrag}
				onDragEnd={onDragEnd}
			/>
		);
	},
);
NewVertex.displayName = "NewVertex";

/**
 * 新規頂点リストプロパティ
 */
type NewVertexListProps = {
	id: string;
	items: Diagram[];
	onItemableChange?: (e: ItemableChangeEvent) => void;
};

/**
 * 新規頂点リストコンポーネント
 */
const NewVertexList: React.FC<NewVertexListProps> = memo(
	({ id, items, onItemableChange }) => {
		// ドラッグ中の新規頂点
		const [draggingNewVertex, setDraggingNewVertex] = useState<
			NewVertexData | undefined
		>();

		// 描画する新規頂点リスト
		const newVertexList: NewVertexData[] = [];
		if (draggingNewVertex) {
			// ドラッグ中の場合はその新規頂点のみ描画
			newVertexList.push(draggingNewVertex);
		} else {
			// ドラッグ中でなければ、各頂点の中点に新規頂点を描画
			for (let i = 0; i < items.length - 1; i++) {
				const item = items[i];
				const nextItem = items[i + 1];

				const x = (item.x + nextItem.x) / 2;
				const y = (item.y + nextItem.y) / 2;

				newVertexList.push({
					id: `${item.id}-${nextItem.id}`, // 前後の頂点からIDを生成
					x,
					y,
				});
			}
		}

		/**
		 * 新規頂点のドラッグ開始イベントハンドラ
		 */
		const handleNewVertexDragStart = useCallback(
			(e: DiagramDragEvent) => {
				const idx = newVertexList.findIndex((v) => v.id === e.id);
				const newItems = [...items];
				const newItem = {
					id: e.id,
					type: "PathPoint",
					x: e.startX,
					y: e.startY,
				} as Diagram;
				newItems.splice(idx + 1, 0, newItem);

				setDraggingNewVertex({ id: e.id, x: e.startX, y: e.startY });

				onItemableChange?.({
					type: e.eventType,
					id,
					items: newItems,
				});
			},
			[onItemableChange, id, items],
		);

		/**
		 * 新規頂点のドラッグ中イベントハンドラ
		 */
		const handleNewVertexDrag = useCallback(
			(e: DiagramDragEvent) => {
				// ドラッグ中の新規頂点の位置を更新
				setDraggingNewVertex({ id: e.id, x: e.endX, y: e.endY });

				// 新規頂点のドラッグに伴うパスの頂点の位置変更
				onItemableChange?.({
					type: e.eventType,
					id,
					items: items.map((item) =>
						item.id === e.id ? { ...item, x: e.endX, y: e.endY } : item,
					),
				});
			},
			[onItemableChange, id, items],
		);

		/**
		 * 新規頂点のドラッグ完了イベントハンドラ
		 */
		const handleNewVertexDragEnd = useCallback(
			(e: DiagramDragEvent) => {
				// ドラッグ中の新規頂点を解除
				setDraggingNewVertex(undefined);

				// 新規頂点のドラッグ完了に伴うパスの外枠の形状計算
				const box = calcPointsOuterBox(
					items.map((item) =>
						item.id === e.id
							? { x: e.endX, y: e.endY }
							: { x: item.x, y: item.y },
					),
				);

				// 新規頂点のドラッグ完了に伴うパスのデータ変更
				onItemableChange?.({
					type: e.eventType,
					id,
					x: box.center.x,
					y: box.center.y,
					width: box.right - box.left,
					height: box.bottom - box.top,
					items: items.map((item) =>
						item.id === e.id
							? {
									...item,
									id: newId(), // ドラッグが完了したら、新規頂点用のIDから新しいIDに変更
									x: e.endX,
									y: e.endY,
								}
							: item,
					),
				});
			},
			[onItemableChange, id, items],
		);

		return (
			<>
				{newVertexList.map((item) => (
					<NewVertex
						key={item.id}
						{...item}
						onDragStart={handleNewVertexDragStart}
						onDrag={handleNewVertexDrag}
						onDragEnd={handleNewVertexDragEnd}
					/>
				))}
			</>
		);
	},
);
NewVertexList.displayName = "NewVertexList";

/**
 * 線分データ
 */
type SegmentData = {
	id: string;
	startPointId: string;
	startX: number;
	startY: number;
	endPointId: string;
	endX: number;
	endY: number;
};

/**
 * 線分プロパティ
 */
type SegmentProps = SegmentData & {
	onPointerDown?: (e: DiagramPointerEvent) => void;
	onClick?: (e: DiagramClickEvent) => void;
	onDragStart?: (e: DiagramDragEvent) => void;
	onDrag?: (e: DiagramDragEvent) => void;
	onDragEnd?: (e: DiagramDragEvent) => void;
	dragPositioningFunction?: (point: Point) => Point;
};

/**
 * 線分コンポーネント
 */
const Segment: React.FC<SegmentProps> = memo(
	({
		id,
		startX,
		startY,
		endX,
		endY,
		onPointerDown,
		onClick,
		onDragStart,
		onDrag,
		onDragEnd,
	}) => {
		const midX = (startX + endX) / 2;
		const midY = (startY + endY) / 2;

		const rotateStartPoint = rotatePoint(
			startX,
			startY,
			midX,
			midY,
			Math.PI / 2,
		);
		const rotateEndPoint = rotatePoint(endX, endY, midX, midY, Math.PI / 2);

		const radian = calcRadians(
			rotateStartPoint.x,
			rotateStartPoint.y,
			rotateEndPoint.x,
			rotateEndPoint.y,
		);
		const cursor = getCursorFromAngle(radiansToDegrees(radian));

		const dragPositioningFunction = useCallback(
			(x: number, y: number) => {
				const degrees = radiansToDegrees(radian);
				const isX2y = (degrees + 405) % 180 > 90;
				return isX2y
					? createLinerX2yFunction(rotateStartPoint, rotateEndPoint)(x, y)
					: createLinerY2xFunction(rotateStartPoint, rotateEndPoint)(x, y);
			},

			[radian, rotateStartPoint, rotateEndPoint],
		);

		return (
			<DragLine
				id={id}
				x={midX}
				y={midY}
				startX={startX}
				startY={startY}
				endX={endX}
				endY={endY}
				cursor={cursor}
				onPointerDown={onPointerDown}
				onClick={onClick}
				onDragStart={onDragStart}
				onDrag={onDrag}
				onDragEnd={onDragEnd}
				dragPositioningFunction={dragPositioningFunction}
			/>
		);
	},
);
Segment.displayName = "Segment";

/**
 * 線分リストプロパティ
 */
type SegmentListProps = {
	id: string;
	items: Diagram[];
	onPointerDown?: (e: DiagramPointerEvent) => void;
	onClick?: (e: DiagramClickEvent) => void;
	onItemableChange?: (e: ItemableChangeEvent) => void;
};

/**
 * 線分リストコンポーネント
 */
const SegmentList: React.FC<SegmentListProps> = memo(
	({ id, items, onPointerDown, onClick, onItemableChange }) => {
		const [draggingSegment, setDraggingSegment] = useState<
			SegmentData | undefined
		>();
		const startSegment = useRef<SegmentData>(undefined);

		const segmentList: SegmentData[] = [];
		if (draggingSegment) {
			segmentList.push(draggingSegment);
		} else {
			for (let i = 0; i < items.length - 1; i++) {
				const item = items[i];
				const nextItem = items[i + 1];

				segmentList.push({
					id: `${item.id}-${nextItem.id}`,
					startX: item.x,
					startY: item.y,
					startPointId: item.id,
					endX: nextItem.x,
					endY: nextItem.y,
					endPointId: nextItem.id,
				});
			}
		}

		/**
		 * 線分のドラッグ開始イベントハンドラ
		 */
		const handleSegmentDragStart = useCallback(
			(e: DiagramDragEvent) => {
				const idx = segmentList.findIndex((v) => v.id === e.id);

				const segment = segmentList[idx];
				startSegment.current = segment;

				const newSegment = {
					...segment,
				};
				if (idx === 0 || idx === segmentList.length - 1) {
					const newItems = [...items];

					if (idx === segmentList.length - 1) {
						const newItem = {
							id: newId(),
							type: "PathPoint",
							x: segment.endX,
							y: segment.endY,
						} as PathPointData;
						newItems.splice(newItems.length - 1, 0, newItem);
						newSegment.endPointId = newItem.id;
					}

					if (idx === 0) {
						const newItem = {
							id: newId(),
							type: "PathPoint",
							x: segment.startX,
							y: segment.startY,
						} as PathPointData;
						newItems.splice(1, 0, newItem);
						newSegment.startPointId = newItem.id;
					}

					onItemableChange?.({
						type: e.eventType,
						id,
						items: newItems,
					});
				}

				setDraggingSegment(newSegment);
			},
			[onItemableChange, id, items],
		);

		/**
		 * 線分のドラッグ中イベントハンドラ
		 */
		const handleSegmentDrag = useCallback(
			(e: DiagramDragEvent) => {
				if (!draggingSegment || !startSegment.current) {
					return;
				}

				const dx = e.endX - e.startX;
				const dy = e.endY - e.startY;
				const newStartX = startSegment.current.startX + dx;
				const newStartY = startSegment.current.startY + dy;
				const newEndX = startSegment.current.endX + dx;
				const newEndY = startSegment.current.endY + dy;

				setDraggingSegment({
					...draggingSegment,
					startX: newStartX,
					startY: newStartY,
					endX: newEndX,
					endY: newEndY,
				});

				onItemableChange?.({
					type: e.eventType,
					id,
					items: items.map((item) => {
						if (item.id === draggingSegment.startPointId) {
							return { ...item, x: newStartX, y: newStartY };
						}
						if (item.id === draggingSegment.endPointId) {
							return { ...item, x: newEndX, y: newEndY };
						}
						return item;
					}),
				});
			},
			[onItemableChange, id, items, draggingSegment],
		);

		/**
		 * 線分のドラッグ完了イベントハンドラ
		 */
		const handleSegmentDragEnd = useCallback(
			(e: DiagramDragEvent) => {
				if (!draggingSegment || !startSegment.current) {
					return;
				}

				const dx = e.endX - e.startX;
				const dy = e.endY - e.startY;
				const newStartX = startSegment.current.startX + dx;
				const newStartY = startSegment.current.startY + dy;
				const newEndX = startSegment.current.endX + dx;
				const newEndY = startSegment.current.endY + dy;
				const box = calcPointsOuterBox(
					items.map((item) =>
						item.id === e.id
							? { x: e.endX, y: e.endY }
							: { x: item.x, y: item.y },
					),
				);
				onItemableChange?.({
					type: e.eventType,
					id,
					x: box.center.x,
					y: box.center.y,
					width: box.right - box.left,
					height: box.bottom - box.top,
					items: items.map((item) => {
						// ドラッグが完了したら、線分用のIDから新しいIDに変更
						if (item.id === draggingSegment.startPointId) {
							return { ...item, x: newStartX, y: newStartY };
						}
						if (item.id === draggingSegment.endPointId) {
							return { ...item, x: newEndX, y: newEndY };
						}
						return item;
					}),
				});
				setDraggingSegment(undefined);
			},
			[onItemableChange, id, items, draggingSegment],
		);

		return segmentList.map((item) => (
			<Segment
				key={item.id}
				{...item}
				onPointerDown={onPointerDown}
				onClick={onClick}
				onDragStart={handleSegmentDragStart}
				onDrag={handleSegmentDrag}
				onDragEnd={handleSegmentDragEnd}
			/>
		));
	},
);
SegmentList.displayName = "SegmentList";
