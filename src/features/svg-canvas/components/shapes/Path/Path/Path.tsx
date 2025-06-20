// Import React.
import type React from "react";
import { memo, useCallback, useEffect, useRef, useState } from "react";

// Import types.
import type { Diagram } from "../../../../types/data/catalog/Diagram";
import type { DiagramBaseData } from "../../../../types/base/DiagramBaseData";
import type { PathData } from "../../../../types/data/shapes/PathData";
import type { DiagramChangeEvent } from "../../../../types/events/DiagramChangeEvent";
import type { DiagramClickEvent } from "../../../../types/events/DiagramClickEvent";
import type { DiagramDragEvent } from "../../../../types/events/DiagramDragEvent";
import type { DiagramPointerEvent } from "../../../../types/events/DiagramPointerEvent";
import type { PathProps } from "../../../../types/props/shapes/PathProps";

// Import components.
import { Outline } from "../../../core/Outline";
import { PositionLabel } from "../../../core/PositionLabel";
import { Group } from "../../Group";
import { NewVertexList } from "../NewVertexList";
import { SegmentList } from "../SegmentList";
import { PathElement } from "./PathStyled";

// Import hooks.
import { useDrag } from "../../../../hooks/useDrag";

// Import utils.
import { calcPointsOuterShape } from "../../../../utils/math/geometry/calcPointsOuterShape";
import {
	createEndPointArrowHead,
	createStartPointArrowHead,
} from "../../../../utils/shapes/path/createArrowHeads";
import { createDValue } from "../../../../utils/shapes/path/createDValue";
import { isItemableData } from "../../../../utils/validation/isItemableData";

// TODO: 枠線と重なってぁE��と頂点編雁E��ードにできなぁE
/**
 * 折れ線コンポ�EネンチE
 * できること�E�E
 * - 折れ線�E描画
 * - 折れ線�E全体ドラチE��
 * - 折れ線�E選抁E
 * - 折れ線�E変形
 * - 折れ線�E線�EのドラチE��
 * - 折れ線�E新規頂点の追加
 */
const PathComponent: React.FC<PathProps> = ({
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
	showOutline = false,
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

	// ハンドラ生�Eの頻発を回避するため、参照する値をuseRefで保持する
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
		// 冁E��変数・冁E��関数
		isSequentialSelection,
		isVerticesMode,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	/**
	 * 折れ線�Eポインターダウンイベントハンドラ
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
	 * 折れ線�EクリチE��イベントハンドラ
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

	// 折れ線�E選択状態制御
	useEffect(() => {
		// グループから選択が外れたら連続選択フラグも解除
		if (!isSelected) {
			setIsSequentialSelection(false);
			setIsVerticesMode(false);
		}
	}, [isSelected]);

	/**
	 * 折れ線�EドラチE��イベントハンドラ
	 */
	const handleDrag = useCallback((e: DiagramDragEvent) => {
		const { id, dragEnabled, items, onDiagramChange, isVerticesMode } =
			refBus.current;

		// ドラチE��が無効な場合�Eイベントを潰してドラチE��を無効匁E
		if (!dragEnabled) {
			return;
		}

		// 頂点モード�E場合�Eイベントを潰してドラチE��を無効匁E
		if (isVerticesMode) {
			return;
		}

		// ドラチE��開始時の処琁E
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
				changeType: "Drag",
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
			changeType: "Drag",
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
	 * 頂点のドラチE��中イベントハンドラ
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
	 * 線�Eおよび新規頂点の変更イベントハンドラ
	 */ const handleDiagramChangeBySegumentAndNewVertex = useCallback(
		(e: DiagramChangeEvent) => {
			if (!isItemableData<DiagramBaseData>(e.endDiagram)) return; // Type guard with DiagramBaseData

			const { rotation, scaleX, scaleY, onDiagramChange } = refBus.current;

			if (e.eventType === "End") {
				// 新規頂点および線�EのドラチE��完亁E��伴ぁE��スの外枠の形状計箁E
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

	// 折れ線�EドラチE��用要素のプロパティ生�E
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

	// 折れ線�Ed属性値を生戁E
	const d = createDValue(items);

	// 頂点惁E��を生戁E
	const isBothEnds = (idx: number) => idx === 0 || idx === items.length - 1;
	const linePoints = items.map((item, idx) => ({
		...item,
		hidden: !isVerticesMode || isDragging || (fixBothEnds && isBothEnds(idx)),
	}));

	// ドラチE��線�Eの表示フラグ
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

	// 全体変形用グループ�E表示フラグ
	const showTransformGroup = isSelected && !isMultiSelectSource;

	// Flag to show the position label.
	const showPositionLabel = isSelected && isDragging;

	// Start ArrowHead.
	const startArrowHeadComp = createStartPointArrowHead({
		items,
		stroke,
		startArrowHead,
	} as PathData);

	// End ArrowHead.
	const endArrowHeadComp = createEndPointArrowHead({
		items,
		stroke,
		endArrowHead,
	} as PathData);

	return (
		<>
			{/* 描画用のパス */}
			<g transform="translate(0.5,0.5)">
				<PathElement
					d={d}
					fill="none"
					stroke={stroke}
					strokeWidth={strokeWidth}
					isTransparent={isMultiSelectSource}
				/>
			</g>
			{/* ドラチE��用のパス */}
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
			{/* 線�EドラチE�� */}
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
			{/* アウトライン�E�褁E��選択用�E�E*/}
			{!showTransformGroup && (
				<Outline
					x={x}
					y={y}
					width={width}
					height={height}
					rotation={rotation}
					scaleX={scaleX}
					scaleY={scaleY}
					isSelected={isSelected}
					isMultiSelectSource={isMultiSelectSource}
					showOutline={showOutline}
				/>
			)}
			{/* 全体変形用グルーチE*/}
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

export const Path = memo(PathComponent);
