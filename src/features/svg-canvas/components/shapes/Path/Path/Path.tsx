// Import React.
import type React from "react";
import { memo, useCallback, useEffect, useRef, useState } from "react";

// Import types.
import type { Diagram } from "../../../../types/data/catalog/Diagram";
import type { DiagramBaseData } from "../../../../types/data/core/DiagramBaseData";
import type { PathData } from "../../../../types/data/shapes/PathData";
import type { DiagramChangeEvent } from "../../../../types/events/DiagramChangeEvent";
import type { DiagramClickEvent } from "../../../../types/events/DiagramClickEvent";
import type { DiagramDragEvent } from "../../../../types/events/DiagramDragEvent";
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
import { useClick } from "../../../../hooks/useClick";
import { useSelect } from "../../../../hooks/useSelect";

// Import utils.
import { calcOrientedShapeFromPoints } from "../../../../utils/math/geometry/calcOrientedShapeFromPoints";
import {
	createEndPointArrowHead,
	createStartPointArrowHead,
} from "../../../../utils/shapes/path/createArrowHeads";
import { createDValue } from "../../../../utils/shapes/path/createDValue";
import { isItemableData } from "../../../../utils/validation/isItemableData";
import { mergeProps } from "../../../../utils/common/mergeProps";

// TODO: Cannot enter vertex editing mode when overlapping with border
/**
 * Polyline component
 * Features:
 * - Polyline drawing
 * - Entire polyline dragging
 * - Polyline selection
 * - Polyline transformation
 * - Line segment dragging
 * - Adding new vertices to polyline
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
	isAncestorSelected = false,
	isDragging = false,
	showOutline = false,
	showTransformControls = false,
	isTransforming = false,
	items = [],
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
	const [isPathPointDragging, setIsPathPointDragging] = useState(false);
	const [isSequentialSelection, setIsSequentialSelection] = useState(false);
	const [isVerticesMode, setIsVerticesMode] = useState(!transformEnabled);

	const startItems = useRef<Diagram[]>(items);
	const dragSvgRef = useRef<SVGPathElement>({} as SVGPathElement);
	// To avoid frequent handler generation, hold referenced values in useRef
	const refBusVal = {
		// Properties
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
		// Internal variables and functions
		isSequentialSelection,
		isVerticesMode,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal; /**
	 * Polyline pointer down event handler
	 */
	const handlePointerDown = useCallback(() => {
		const { isSelected, transformEnabled } = refBus.current;

		if (!transformEnabled) {
			setIsVerticesMode(true);
		}

		if (isSelected) {
			setIsSequentialSelection(true);
		}
	}, []);
	/**
	 * Polyline click event handler
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
			isSelectedOnPointerDown: e.isSelectedOnPointerDown,
			isAncestorSelectedOnPointerDown: e.isAncestorSelectedOnPointerDown,
		});
	}, []);
	// Polyline selection state control
	useEffect(() => {
		// Clear sequential selection flag when selection is removed from group
		if (!isSelected) {
			setIsSequentialSelection(false);
			setIsVerticesMode(false);
		}
	}, [isSelected]);
	/**
	 * Polyline drag event handler
	 */
	const handleDrag = useCallback((e: DiagramDragEvent) => {
		const { id, dragEnabled, items, onDiagramChange, isVerticesMode } =
			refBus.current;

		// Disable dragging by suppressing event when drag is disabled
		if (!dragEnabled) {
			return;
		}

		// Disable dragging by suppressing event when in vertices mode
		if (isVerticesMode) {
			return;
		}

		// Processing at drag start
		if (e.eventType === "Start") {
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
	}, []);
	/**
	 * Vertex drag event handler
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
	 * Change event handler for line segments and new vertices
	 */
	const handleDiagramChangeBySegumentAndNewVertex = useCallback(
		(e: DiagramChangeEvent) => {
			if (!isItemableData<DiagramBaseData>(e.endDiagram)) return; // Type guard with DiagramBaseData

			const { rotation, scaleX, scaleY, onDiagramChange } = refBus.current;
			if (e.eventType === "End") {
				// Calculate new shape of Path's bounding box when new vertex and line segment dragging is completed
				const newShape = calcOrientedShapeFromPoints(
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
	// Generate properties for polyline drag element
	const dragProps = useDrag({
		id,
		type: "Path",
		x,
		y,
		ref: dragSvgRef,
		onPointerDown: handlePointerDown,
		onDrag: handleDrag,
	});
	// Generate properties for clicking
	const clickProps = useClick({
		id,
		x,
		y,
		isSelected,
		isAncestorSelected,
		ref: dragSvgRef,
		onClick: handleClick,
	}); // Generate properties for selection
	const selectProps = useSelect({
		id,
		onSelect,
	});
	// Compose props for path element
	const composedProps = mergeProps(dragProps, clickProps, selectProps);

	// Generate polyline d attribute value
	const d = createDValue(items);

	// Generate vertex information
	const isBothEnds = (idx: number) => idx === 0 || idx === items.length - 1;
	const linePoints = items.map((item, idx) => ({
		...item,
		hidden: !isVerticesMode || isDragging || (fixBothEnds && isBothEnds(idx)),
	}));

	// Display flag for dragging line segments
	const showSegmentList =
		segmentDragEnabled &&
		isSelected &&
		isVerticesMode &&
		!isDragging &&
		!isPathPointDragging;
	// Display flag for new vertices
	const showNewVertex =
		newVertexEnabled &&
		isSelected &&
		isVerticesMode &&
		!isDragging &&
		!isPathPointDragging;

	// Display flag for overall transform group
	const showTransformGroup = showTransformControls;

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
			{/* Path for drawing */}
			<g transform="translate(0.5,0.5)">
				<PathElement
					d={d}
					fill="none"
					stroke={stroke}
					strokeWidth={strokeWidth}
					isTransparent={false}
				/>
			</g>
			{/* Path for dragging */}
			<path
				id={id}
				d={d}
				fill="none"
				stroke="transparent"
				strokeWidth={5}
				cursor={dragEnabled ? "move" : "pointer"}
				tabIndex={0}
				ref={dragSvgRef}
				{...composedProps}
			/>
			{/* Start point arrow head. */}
			{startArrowHeadComp}
			{/* End point arrow head. */}
			{endArrowHeadComp}
			{/* Line segment dragging */}
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
			{/* New vertices */}
			{showNewVertex && (
				<NewVertexList
					id={id}
					items={items}
					onDiagramChange={handleDiagramChangeBySegumentAndNewVertex}
				/>
			)}
			{/* Outline for selection only */}
			{!showTransformGroup && (
				<Outline
					x={x}
					y={y}
					width={width}
					height={height}
					rotation={rotation}
					scaleX={scaleX}
					scaleY={scaleY}
					showOutline={showOutline}
				/>
			)}
			{/* Overall transform group */}
			{showTransformGroup && (
				<Group
					id={id}
					x={x}
					y={y}
					isSelected={showTransformControls && !isVerticesMode}
					showTransformControls={showTransformControls}
					showOutline={showOutline}
					width={width}
					height={height}
					rotation={rotation}
					scaleX={scaleX}
					scaleY={scaleY}
					keepProportion={keepProportion}
					items={linePoints}
					isTransforming={isTransforming}
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
