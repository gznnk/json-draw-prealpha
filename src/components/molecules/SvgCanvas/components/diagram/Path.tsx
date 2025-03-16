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
	Diagram,
	DiagramBaseProps,
	PathData,
	PathPointData,
	TransformativeProps,
} from "../../types/DiagramTypes";
import type {
	DiagramClickEvent,
	DiagramDragEvent,
	DiagramPointerEvent,
	GroupDataChangeEvent,
} from "../../types/EventTypes";

// SvgCanvas関連カスタムフックをインポート
import { useDrag } from "../../hooks/dragHooks";

// SvgCanvas関連関数をインポート
import {
	calcPointsOuterBox,
	calcRadian,
	createLinerX2yFunction,
	createLinerY2xFunction,
	radiansToDegrees,
	rotatePoint,
} from "../../functions/Math";
import { newId, getCursorFromAngle } from "../../functions/Diagram";

import { drawPoint } from "../../functions/Diagram";

// ユーティリティをインポート
// import { getLogger } from "../../../../../utils/Logger";

// const logger = getLogger("Path");

const createDValue = (items: Diagram[]) => {
	let d = "";
	for (let i = 0; i < items.length; i++) {
		const item = items[i];
		d += `${i === 0 ? "M" : "L"} ${item.point.x} ${item.point.y} `;
	}
	return d;
};

export type PathProps = DiagramBaseProps &
	TransformativeProps &
	PathData & {
		dragEnabled?: boolean;
		segmentDragEnabled?: boolean;
		newVertexEnabled?: boolean;
		onGroupDataChange?: (e: GroupDataChangeEvent) => void; // TODO: 共通化
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
	dragEnabled = false,
	segmentDragEnabled = true,
	newVertexEnabled = true,
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
			if (isSequentialSelection) {
				setIsTransformMode(!isTransformMode);
			}
			onClick?.({
				id,
			});
		},
		[onClick, id, isSequentialSelection, isTransformMode],
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
		[onDrag, onGroupDataChange, id, dragEnabled, isDragging],
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
		point,
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
	const linePoints = items.map((item) => ({
		...item,
		hidden: isTransformMode || isDragging,
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
				cursor={dragEnabled ? "move" : "default"}
				tabIndex={0}
				ref={dragSvgRef}
				{...dragProps}
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
					onDragStart={handlePathPointDragStart}
					onDrag={handlePathPointDrag}
					onDragEnd={handlePathPointDragEnd}
					onTransform={onTransform}
					onGroupDataChange={onGroupDataChange}
				/>
			)}
			{/* 線分ドラッグ */}
			{segmentDragEnabled && isSelected && (
				<SegmentList
					id={id}
					items={items}
					onGroupDataChange={onGroupDataChange}
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
						onGroupDataChange={onGroupDataChange}
					/>
				)}
		</>
	);
};

export default memo(Path);

/**
 * 折れ線の頂点プロパティ
 */
type PathPointProps = DiagramBaseProps & PathPointData;

/**
 * 折れ線の頂点コンポーネント
 */
export const PathPoint: React.FC<PathPointProps> = memo(
	({ id, point, hidden, onDragStart, onDrag, onDragEnd }) => {
		return (
			<DragPoint
				id={id}
				point={point}
				hidden={hidden}
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
	point: Point;
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
	({ id, point, onDragStart, onDrag, onDragEnd }) => {
		return (
			<DragPoint
				id={id}
				point={point}
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
	onGroupDataChange?: (e: GroupDataChangeEvent) => void;
};

/**
 * 新規頂点リストコンポーネント
 */
const NewVertexList: React.FC<NewVertexListProps> = memo(
	({ id, items, onGroupDataChange }) => {
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

				const x = (item.point.x + nextItem.point.x) / 2;
				const y = (item.point.y + nextItem.point.y) / 2;

				newVertexList.push({
					id: `${item.id}-${nextItem.id}`, // 前後の頂点からIDを生成
					point: { x, y },
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
					point: e.startPoint,
					isSelected: false,
				} as Diagram;
				newItems.splice(idx + 1, 0, newItem);

				setDraggingNewVertex({ id: e.id, point: e.startPoint });

				onGroupDataChange?.({
					id,
					items: newItems,
				});
			},
			[onGroupDataChange, id, items],
		);

		/**
		 * 新規頂点のドラッグ中イベントハンドラ
		 */
		const handleNewVertexDrag = useCallback(
			(e: DiagramDragEvent) => {
				// ドラッグ中の新規頂点の位置を更新
				setDraggingNewVertex({ id: e.id, point: e.endPoint });

				// 新規頂点のドラッグに伴うパスの頂点の位置変更
				onGroupDataChange?.({
					id,
					items: items.map((item) =>
						item.id === e.id ? { ...item, point: e.endPoint } : item,
					),
				});
			},
			[onGroupDataChange, id, items],
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
					items.map((item) => (item.id === e.id ? e.endPoint : item.point)),
				);

				// 新規頂点のドラッグ完了に伴うパスのデータ変更
				onGroupDataChange?.({
					id,
					point: box.center,
					width: box.right - box.left,
					height: box.bottom - box.top,
					items: items.map((item) =>
						item.id === e.id
							? {
									...item,
									id: newId(), // ドラッグが完了したら、新規頂点用のIDから新しいIDに変更
									point: e.endPoint,
								}
							: item,
					),
				});
			},
			[onGroupDataChange, id, items],
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
	startPoint: Point;
	endPointId: string;
	endPoint: Point;
};

/**
 * 線分プロパティ
 */
type SegmentProps = SegmentData & {
	onDragStart?: (e: DiagramDragEvent) => void;
	onDrag?: (e: DiagramDragEvent) => void;
	onDragEnd?: (e: DiagramDragEvent) => void;
	dragPositioningFunction?: (point: Point) => Point;
};

/**
 * 線分コンポーネント
 */
const Segment: React.FC<SegmentProps> = memo(
	({ id, startPoint, endPoint, onDragStart, onDrag, onDragEnd }) => {
		const midPoint = {
			x: (startPoint.x + endPoint.x) / 2,
			y: (startPoint.y + endPoint.y) / 2,
		};

		const rotateStartPoint = rotatePoint(startPoint, midPoint, Math.PI / 2);
		const rotateEndPoint = rotatePoint(endPoint, midPoint, Math.PI / 2);

		const radian = calcRadian(rotateStartPoint, rotateEndPoint);
		const cursor = getCursorFromAngle(radiansToDegrees(radian));

		const dragPositioningFunction = useCallback(
			(p: Point) => {
				const degrees = radiansToDegrees(radian);
				const isX2y = (degrees + 405) % 180 > 90;
				return isX2y
					? createLinerX2yFunction(rotateStartPoint, rotateEndPoint)(p)
					: createLinerY2xFunction(rotateStartPoint, rotateEndPoint)(p);
			},

			[radian, rotateStartPoint, rotateEndPoint],
		);

		return (
			<DragLine
				id={id}
				point={midPoint}
				startPoint={startPoint}
				endPoint={endPoint}
				cursor={cursor}
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
	onGroupDataChange?: (e: GroupDataChangeEvent) => void;
};

/**
 * 線分リストコンポーネント
 */
const SegmentList: React.FC<SegmentListProps> = memo(
	({ id, items, onGroupDataChange }) => {
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
					startPoint: item.point,
					startPointId: item.id,
					endPoint: nextItem.point,
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
							point: segment.endPoint,
							isSelected: false,
						} as Diagram;
						newItems.splice(newItems.length - 1, 0, newItem);
						newSegment.endPointId = newItem.id;
					}

					if (idx === 0) {
						const newItem = {
							id: newId(),
							type: "PathPoint",
							point: segment.startPoint,
							isSelected: false,
						} as Diagram;
						newItems.splice(1, 0, newItem);
						newSegment.startPointId = newItem.id;
					}

					onGroupDataChange?.({
						id,
						items: newItems,
					});
				}

				setDraggingSegment(newSegment);
			},
			[onGroupDataChange, id, items],
		);

		/**
		 * 線分のドラッグ中イベントハンドラ
		 */
		const handleSegmentDrag = useCallback(
			(e: DiagramDragEvent) => {
				if (!draggingSegment || !startSegment.current) {
					return;
				}

				const dx = e.endPoint.x - e.startPoint.x;
				const dy = e.endPoint.y - e.startPoint.y;
				const newStartPoint = {
					x: startSegment.current.startPoint.x + dx,
					y: startSegment.current.startPoint.y + dy,
				};
				const newEndPoint = {
					x: startSegment.current.endPoint.x + dx,
					y: startSegment.current.endPoint.y + dy,
				};

				setDraggingSegment({
					...draggingSegment,
					startPoint: newStartPoint,
					endPoint: newEndPoint,
				});

				onGroupDataChange?.({
					id,
					items: items.map((item) => {
						if (item.id === draggingSegment.startPointId) {
							return { ...item, point: newStartPoint };
						}
						if (item.id === draggingSegment.endPointId) {
							return { ...item, point: newEndPoint };
						}
						return item;
					}),
				});
			},
			[onGroupDataChange, id, items, draggingSegment],
		);

		/**
		 * 線分のドラッグ完了イベントハンドラ
		 */
		const handleSegmentDragEnd = useCallback(
			(e: DiagramDragEvent) => {
				if (!draggingSegment || !startSegment.current) {
					return;
				}

				const dx = e.endPoint.x - e.startPoint.x;
				const dy = e.endPoint.y - e.startPoint.y;
				const newStartPoint = {
					x: startSegment.current.startPoint.x + dx,
					y: startSegment.current.startPoint.y + dy,
				};
				const newEndPoint = {
					x: startSegment.current.endPoint.x + dx,
					y: startSegment.current.endPoint.y + dy,
				};
				const box = calcPointsOuterBox(
					items.map((item) => (item.id === e.id ? e.endPoint : item.point)),
				);
				onGroupDataChange?.({
					id,
					point: box.center,
					width: box.right - box.left,
					height: box.bottom - box.top,
					items: items.map((item) => {
						// ドラッグが完了したら、線分用のIDから新しいIDに変更
						if (item.id === draggingSegment.startPointId) {
							return { ...item, point: newStartPoint };
						}
						if (item.id === draggingSegment.endPointId) {
							return { ...item, point: newEndPoint };
						}
						return item;
					}),
				});
				setDraggingSegment(undefined);
			},
			[onGroupDataChange, id, items, draggingSegment],
		);

		return segmentList.map((item) => (
			<Segment
				key={item.id}
				{...item}
				onDragStart={handleSegmentDragStart}
				onDrag={handleSegmentDrag}
				onDragEnd={handleSegmentDragEnd}
			/>
		));
	},
);
SegmentList.displayName = "SegmentList";
