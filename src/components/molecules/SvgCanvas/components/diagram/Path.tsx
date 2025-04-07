// Import React library.
import type React from "react";
import { memo, useCallback, useEffect, useRef, useState } from "react";

// Import SvgCanvas related components.
import ArrowHead from "../core/ArrowHead";
import DragLine from "../core/DragLine";
import DragPoint from "../core/DragPoint";
import PositionLabel from "../core/PositionLabel";
import Group from "./Group";

// Import SvgCanvas related types.
import type { Point } from "../../types/CoordinateTypes";
import type {
	CreateDiagramProps,
	Diagram,
	PathData,
	PathPointData,
} from "../../types/DiagramTypes";
import type {
	DiagramChangeEvent,
	DiagramClickEvent,
	DiagramDragEvent,
	DiagramPointerEvent,
} from "../../types/EventTypes";

// Import SvgCanvas related hooks.
import { useDrag } from "../../hooks/dragHooks";

// Import SvgCanvas related functions.
import { getCursorFromAngle, newId } from "../../functions/Diagram";
import {
	calcPointsOuterShape,
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
	rightAngleSegmentDrag?: boolean;
	newVertexEnabled?: boolean;
	fixBothEnds?: boolean;
};

// TODO: 枠線と重なっていると頂点編集モードにできない
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
	isMultiSelectSource = false,
	items = [],
	syncWithSameId = false,
	dragEnabled = true,
	transformEnabled = true,
	segmentDragEnabled = true,
	rightAngleSegmentDrag = false,
	newVertexEnabled = true,
	fixBothEnds = false,
	startArrowHead = "None",
	endArrowHead = "None",
	onClick,
	onDrag,
	onSelect,
	onTransform,
	onDiagramChange,
}) => {
	const [isDragging, setIsDragging] = useState(false);
	const [isPathPointDragging, setIsPathPointDragging] = useState(false);
	const [isSequentialSelection, setIsSequentialSelection] = useState(false);
	const [isVerticesMode, setIsVerticesMode] = useState(!transformEnabled);

	const startItems = useRef<Diagram[]>(items);
	const dragSvgRef = useRef<SVGPathElement>({} as SVGPathElement);

	// ハンドラ生成の頻発を回避するため、参照する値をuseRefで保持する
	const refBusVal = {
		// プロパティ
		id,
		x,
		y,
		rotation,
		scaleX,
		scaleY,
		isSelected,
		transformEnabled,
		dragEnabled,
		items,
		onDrag,
		onSelect,
		onClick,
		onDiagramChange,
		// 内部変数・内部関数
		isSequentialSelection,
		isVerticesMode,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	/**
	 * 折れ線のポインターダウンイベントハンドラ
	 */
	const handlePointerDown = useCallback((e: DiagramPointerEvent) => {
		const { id, isSelected, transformEnabled, onSelect } = refBus.current;

		// 図形選択イベントを発火
		onSelect?.({
			eventId: e.eventId,
			id,
		});

		if (!transformEnabled) {
			setIsVerticesMode(true);
		}

		if (isSelected) {
			setIsSequentialSelection(true);
		}
	}, []);

	/**
	 * 折れ線のクリックイベントハンドラ
	 */
	const handleClick = useCallback((e: DiagramClickEvent) => {
		const {
			id,
			isSequentialSelection,
			isVerticesMode,
			transformEnabled,
			onClick,
		} = refBus.current;

		if (isSequentialSelection && transformEnabled) {
			setIsVerticesMode(!isVerticesMode);
		}
		onClick?.({
			eventId: e.eventId,
			id,
		});
	}, []);

	// 折れ線の選択状態制御
	useEffect(() => {
		// グループから選択が外れたら連続選択フラグも解除
		if (!isSelected) {
			setIsSequentialSelection(false);
			setIsVerticesMode(false);
		}
	}, [isSelected]);

	/**
	 * 折れ線のドラッグイベントハンドラ
	 */
	const handleDrag = useCallback((e: DiagramDragEvent) => {
		const { id, dragEnabled, items, onDiagramChange, isVerticesMode } =
			refBus.current;

		// ドラッグが無効な場合はイベントを潰してドラッグを無効化
		if (!dragEnabled) {
			return;
		}

		// 頂点モードの場合はイベントを潰してドラッグを無効化
		if (isVerticesMode) {
			return;
		}

		// ドラッグ開始時の処理
		if (e.eventType === "Start") {
			setIsDragging(true);

			startItems.current = items;

			const startDiagram = {
				x: e.startX,
				y: e.startY,
				items: startItems.current,
			};

			onDiagramChange?.({
				eventId: e.eventId,
				eventType: e.eventType,
				id,
				startDiagram,
				endDiagram: startDiagram,
			});

			return;
		}

		const dx = e.endX - e.startX;
		const dy = e.endY - e.startY;

		const newItems = startItems.current.map((item) => {
			const x = item.x + dx;
			const y = item.y + dy;
			return { ...item, x, y };
		});

		onDiagramChange?.({
			eventId: e.eventId,
			eventType: e.eventType,
			id,
			startDiagram: {
				x: e.startX,
				y: e.startY,
				items: startItems.current,
			},
			endDiagram: {
				x: e.endX,
				y: e.endY,
				items: newItems,
			},
		});

		if (e.eventType === "End") {
			setIsDragging(false);
		}
	}, []);

	/**
	 * 頂点のドラッグ中イベントハンドラ
	 */
	const handlePathPointDrag = useCallback((e: DiagramDragEvent) => {
		if (e.eventType === "Start") {
			setIsPathPointDragging(true);
		}

		refBus.current.onDrag?.(e);

		if (e.eventType === "End") {
			setIsPathPointDragging(false);
		}
	}, []);

	/**
	 * 線分および新規頂点の変更イベントハンドラ
	 */
	const handleDiagramChangeBySegumentAndNewVertex = useCallback(
		(e: DiagramChangeEvent) => {
			const { rotation, scaleX, scaleY, onDiagramChange } = refBus.current;

			if (e.eventType === "End") {
				// 新規頂点および線分のドラッグ完了に伴うパスの外枠の形状計算
				const newShape = calcPointsOuterShape(
					(e.endDiagram.items ?? []).map((p) => ({ x: p.x, y: p.y })),
					rotation,
					scaleX,
					scaleY,
				);

				// Apply the new shape of the Path component.
				onDiagramChange?.({
					...e,
					endDiagram: {
						...e.endDiagram,
						x: newShape.x,
						y: newShape.y,
						width: newShape.width,
						height: newShape.height,
					},
				});
			} else {
				onDiagramChange?.(e);
			}
		},
		[],
	);

	// 折れ線のドラッグ用要素のプロパティ生成
	const dragProps = useDrag({
		id,
		type: "Path",
		x,
		y,
		syncWithSameId,
		ref: dragSvgRef,
		onPointerDown: handlePointerDown,
		onClick: handleClick,
		onDrag: handleDrag,
	});

	// 折れ線のd属性値を生成
	const d = createDValue(items);

	// 頂点情報を生成
	const isBothEnds = (idx: number) => idx === 0 || idx === items.length - 1;
	const linePoints = items.map((item, idx) => ({
		...item,
		hidden: !isVerticesMode || isDragging || (fixBothEnds && isBothEnds(idx)),
	}));

	// ドラッグ線分の表示フラグ
	const showSegmentList =
		segmentDragEnabled &&
		isSelected &&
		isVerticesMode &&
		!isDragging &&
		!isPathPointDragging &&
		!isMultiSelectSource;

	// 新規頂点の表示フラグ
	const showNewVertex =
		newVertexEnabled &&
		isSelected &&
		isVerticesMode &&
		!isDragging &&
		!isPathPointDragging &&
		!isMultiSelectSource;

	// 全体変形用グループの表示フラグ
	const showTransformGroup = isSelected && !isMultiSelectSource;

	// Flag to show the position label.
	const showPositionLabel = isSelected && isDragging;

	// ArrowHead.
	let startArrowHeadComp = undefined;
	let endArrowHeadComp = undefined;
	if (1 < items.length) {
		if (startArrowHead && startArrowHead !== "None") {
			const startPoint = items[0];
			const start2thPoint = items[1];
			const startArrowHeadRadians = calcRadians(
				startPoint.x,
				startPoint.y,
				start2thPoint.x,
				start2thPoint.y,
			);
			startArrowHeadComp = (
				<ArrowHead
					type={startArrowHead}
					color={stroke}
					x={startPoint.x}
					y={startPoint.y}
					radians={startArrowHeadRadians}
				/>
			);
		}
		if (endArrowHead && endArrowHead !== "None") {
			const endPoint = items[items.length - 1];
			const end2thPoint = items[items.length - 2];
			const endArrowHeadRadians = calcRadians(
				endPoint.x,
				endPoint.y,
				end2thPoint.x,
				end2thPoint.y,
			);
			endArrowHeadComp = (
				<ArrowHead
					type={endArrowHead}
					color={stroke}
					x={endPoint.x}
					y={endPoint.y}
					radians={endArrowHeadRadians}
				/>
			);
		}
	}

	return (
		<>
			{/* 描画用のパス */}
			<g transform="translate(0.5,0.5)">
				<path
					className="diagram"
					d={d}
					fill="none"
					stroke={stroke}
					strokeWidth={strokeWidth}
				/>
			</g>
			{/* ドラッグ用のパス */}
			<path
				id={id}
				d={d}
				fill="none"
				stroke="transparent"
				strokeWidth={5}
				cursor={dragEnabled ? "move" : "pointer"}
				tabIndex={0}
				ref={dragSvgRef}
				{...dragProps}
			/>
			{/* Start point arrow head. */}
			{startArrowHeadComp}
			{/* End point arrow head. */}
			{endArrowHeadComp}
			{/* 線分ドラッグ */}
			{showSegmentList && (
				<SegmentList
					id={id}
					rightAngleSegmentDrag={rightAngleSegmentDrag}
					fixBothEnds={fixBothEnds}
					items={items}
					onPointerDown={handlePointerDown}
					onClick={handleClick}
					onDiagramChange={handleDiagramChangeBySegumentAndNewVertex}
				/>
			)}
			{/* 新規頂点 */}
			{showNewVertex && (
				<NewVertexList
					id={id}
					items={items}
					onDiagramChange={handleDiagramChangeBySegumentAndNewVertex}
				/>
			)}
			{/* 全体変形用グループ */}
			{showTransformGroup && (
				<Group
					id={id}
					x={x}
					y={y}
					isSelected={transformEnabled && !isVerticesMode}
					isMultiSelectSource={isMultiSelectSource}
					width={width}
					height={height}
					rotation={rotation}
					scaleX={scaleX}
					scaleY={scaleY}
					keepProportion={keepProportion}
					items={linePoints}
					onDrag={handlePathPointDrag}
					onTransform={onTransform}
					onDiagramChange={onDiagramChange}
				/>
			)}
			{/* Position label. */}
			{showPositionLabel && (
				<PositionLabel
					x={x}
					y={y}
					width={width}
					height={height}
					rotation={rotation}
					scaleX={scaleX}
					scaleY={scaleY}
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
	({ id, x, y, hidden, onDrag }) => {
		return <DragPoint id={id} x={x} y={y} hidden={hidden} onDrag={onDrag} />;
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
	onDrag?: (e: DiagramDragEvent) => void;
};

/**
 * 新規頂点コンポーネント
 */
const NewVertex: React.FC<NewVertexProps> = memo(({ id, x, y, onDrag }) => {
	return <DragPoint id={id} x={x} y={y} fill="white" onDrag={onDrag} />;
});
NewVertex.displayName = "NewVertex";

/**
 * 新規頂点リストプロパティ
 */
type NewVertexListProps = {
	id: string;
	items: Diagram[];
	onDiagramChange?: (e: DiagramChangeEvent) => void;
};

/**
 * 新規頂点リストコンポーネント
 */
const NewVertexList: React.FC<NewVertexListProps> = memo(
	({ id, items, onDiagramChange }) => {
		// Dragging NewVertex component data.
		const [draggingNewVertex, setDraggingNewVertex] = useState<
			NewVertexData | undefined
		>();

		// Items of owner Path component at the start of the new vertex drag.
		const startItems = useRef<Diagram[]>(items);

		// NewVertex data list for rendering.
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

		// ハンドラ生成の頻発を回避するため、参照する値をuseRefで保持する
		const refBusVal = {
			// プロパティ
			id,
			items,
			onDiagramChange,
			// 内部変数・内部関数
			newVertexList,
		};
		const refBus = useRef(refBusVal);
		refBus.current = refBusVal;

		/**
		 * 新規頂点のドラッグイベントハンドラ
		 */
		const handleNewVertexDrag = useCallback((e: DiagramDragEvent) => {
			const { id, items, onDiagramChange, newVertexList } = refBus.current;
			// ドラッグ開始時の処理
			if (e.eventType === "Start") {
				// Store the items of owner Path component at the start of the new vertex drag.
				startItems.current = items;

				// ドラッグ中の新規頂点を設定
				setDraggingNewVertex({ id: e.id, x: e.startX, y: e.startY });

				// 新規頂点と同じ位置に頂点を追加し、パスを更新する
				const idx = newVertexList.findIndex((v) => v.id === e.id);
				const newItems = [...items];
				const newItem = {
					id: e.id,
					type: "PathPoint",
					x: e.startX,
					y: e.startY,
				} as Diagram;
				newItems.splice(idx + 1, 0, newItem);

				// パスの変更を通知
				onDiagramChange?.({
					eventId: e.eventId,
					eventType: e.eventType,
					id,
					startDiagram: {
						items: startItems.current,
					},
					endDiagram: {
						items: newItems,
					},
				});
			}

			// ドラッグ中の処理
			if (e.eventType === "InProgress") {
				// ドラッグ中の新規頂点の位置を更新
				setDraggingNewVertex({ id: e.id, x: e.endX, y: e.endY });

				// 新規頂点のドラッグに伴うパスの頂点の位置変更を通知
				onDiagramChange?.({
					eventId: e.eventId,
					eventType: e.eventType,
					id,
					startDiagram: {
						items: startItems.current,
					},
					endDiagram: {
						items: items.map((item) =>
							item.id === e.id ? { ...item, x: e.endX, y: e.endY } : item,
						),
					},
				});
			}

			// ドラッグ完了時の処理
			if (e.eventType === "End") {
				// ドラッグ中の新規頂点を解除
				setDraggingNewVertex(undefined);

				// 新規頂点のドラッグ完了に伴うパスのデータ変更を通知
				onDiagramChange?.({
					eventId: e.eventId,
					eventType: e.eventType,
					id,
					startDiagram: {
						items: startItems.current,
					},
					endDiagram: {
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
					},
				});
			}
		}, []);

		return (
			<>
				{newVertexList.map((item) => (
					<NewVertex key={item.id} {...item} onDrag={handleNewVertexDrag} />
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
	rightAngleSegmentDrag: boolean;
	onPointerDown?: (e: DiagramPointerEvent) => void;
	onClick?: (e: DiagramClickEvent) => void;
	onDrag?: (e: DiagramDragEvent) => void;
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
		rightAngleSegmentDrag,
		onPointerDown,
		onClick,
		onDrag,
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
		const cursor = rightAngleSegmentDrag
			? getCursorFromAngle(radiansToDegrees(radian))
			: "move";

		// ハンドラ生成の頻発を回避するため、参照する値をuseRefで保持する
		const refBusVal = {
			// 内部変数・内部関数
			radian,
			rotateStartPoint,
			rotateEndPoint,
		};
		const refBus = useRef(refBusVal);
		refBus.current = refBusVal;

		const dragPositioningFunction = useCallback((x: number, y: number) => {
			const { radian, rotateStartPoint, rotateEndPoint } = refBus.current;

			const degrees = radiansToDegrees(radian);
			const isX2y = (degrees + 405) % 180 > 90;
			return isX2y
				? createLinerX2yFunction(rotateStartPoint, rotateEndPoint)(x, y)
				: createLinerY2xFunction(rotateStartPoint, rotateEndPoint)(x, y);
		}, []);

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
				onDrag={onDrag}
				dragPositioningFunction={
					rightAngleSegmentDrag ? dragPositioningFunction : undefined
				}
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
	rightAngleSegmentDrag: boolean;
	fixBothEnds: boolean;
	items: Diagram[];
	onPointerDown?: (e: DiagramPointerEvent) => void;
	onClick?: (e: DiagramClickEvent) => void;
	onDiagramChange?: (e: DiagramChangeEvent) => void;
};

/**
 * 線分リストコンポーネント
 */
const SegmentList: React.FC<SegmentListProps> = memo(
	({
		id,
		rightAngleSegmentDrag,
		fixBothEnds,
		items,
		onPointerDown,
		onClick,
		onDiagramChange,
	}) => {
		const [draggingSegment, setDraggingSegment] = useState<
			SegmentData | undefined
		>();
		const startSegment = useRef<SegmentData>(undefined);

		// Items of owner Path component at the start of the segment drag.
		const startItems = useRef<Diagram[]>(items);

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

		// Create references bypass to avoid function creation in every render.
		const refBusVal = {
			// Component properties
			id,
			items,
			fixBothEnds,
			onDiagramChange,
			// Internal variables and functions
			draggingSegment,
			segmentList,
		};
		const refBus = useRef(refBusVal);
		refBus.current = refBusVal;

		/**
		 * Handle segment drag event.
		 */
		const handleSegmentDrag = useCallback((e: DiagramDragEvent) => {
			// Bypass references to avoid function creation in every render.
			const {
				id,
				fixBothEnds,
				items,
				onDiagramChange,
				draggingSegment,
				segmentList,
			} = refBus.current;

			// Process the drag start event.
			if (e.eventType === "Start") {
				// Store the items at the start of the segment drag.
				startItems.current = items;

				// Find the index of the segment being dragged.
				const idx = segmentList.findIndex((v) => v.id === e.id);

				// Store segment data at the start of the segment drag.
				const segment = segmentList[idx];
				startSegment.current = segment;

				// Prepare a new segment data.
				const newSegment = {
					...segment,
				};

				if (fixBothEnds && (idx === 0 || idx === segmentList.length - 1)) {
					// If both ends are fixed, add a new vertex when moving both ends of the segment.
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

					onDiagramChange?.({
						eventId: e.eventId,
						eventType: e.eventType,
						id,
						startDiagram: {
							items: startItems.current,
						},
						endDiagram: {
							items: newItems,
						},
					});
				}

				setDraggingSegment(newSegment);
			}

			if (!draggingSegment || !startSegment.current) {
				return;
			}

			const dx = e.endX - e.startX;
			const dy = e.endY - e.startY;
			const newStartX = startSegment.current.startX + dx;
			const newStartY = startSegment.current.startY + dy;
			const newEndX = startSegment.current.endX + dx;
			const newEndY = startSegment.current.endY + dy;

			if (e.eventType === "InProgress") {
				setDraggingSegment({
					...draggingSegment,
					startX: newStartX,
					startY: newStartY,
					endX: newEndX,
					endY: newEndY,
				});

				onDiagramChange?.({
					eventId: e.eventId,
					eventType: e.eventType,
					id,
					startDiagram: {
						items: startItems.current,
					},
					endDiagram: {
						items: items.map((item) => {
							if (item.id === draggingSegment.startPointId) {
								return { ...item, x: newStartX, y: newStartY };
							}
							if (item.id === draggingSegment.endPointId) {
								return { ...item, x: newEndX, y: newEndY };
							}
							return item;
						}),
					},
				});
			}

			if (e.eventType === "End") {
				onDiagramChange?.({
					eventId: e.eventId,
					eventType: e.eventType,
					id,
					startDiagram: {
						items: startItems.current,
					},
					endDiagram: {
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
					},
				});
				setDraggingSegment(undefined);
			}
		}, []);

		return segmentList.map((item) => (
			<Segment
				key={item.id}
				{...item}
				rightAngleSegmentDrag={rightAngleSegmentDrag}
				onPointerDown={onPointerDown}
				onClick={onClick}
				onDrag={handleSegmentDrag}
			/>
		));
	},
);
SegmentList.displayName = "SegmentList";
