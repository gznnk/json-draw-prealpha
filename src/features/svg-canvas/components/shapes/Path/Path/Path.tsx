// Import React.
import type React from "react";
import { memo, useCallback, useEffect, useRef, useState } from "react";

// Import types.
import type { DiagramBaseData } from "../../../../types/data/core/DiagramBaseData";
import type { PathData } from "../../../../types/data/shapes/PathData";
import type { DiagramChangeEvent } from "../../../../types/events/DiagramChangeEvent";
import type { DiagramClickEvent } from "../../../../types/events/DiagramClickEvent";
import type { DiagramDragEvent } from "../../../../types/events/DiagramDragEvent";
import type { PathProps } from "../../../../types/props/shapes/PathProps";

// Import components.
// import { Outline } from "../../../core/Outline";
import { PositionLabel } from "../../../core/PositionLabel";
import { Group } from "../../Group";
import { NewVertexList } from "../NewVertexList";
import { SegmentList } from "../SegmentList";
import { PathElement } from "./PathStyled";

// Import hooks.
import { useClick } from "../../../../hooks/useClick";
import { useDrag } from "../../../../hooks/useDrag";
import { useSelect } from "../../../../hooks/useSelect";

// Import utils.
import { mergeProps } from "../../../../utils/core/mergeProps";
import { calcOrientedShapeFromPoints } from "../../../../utils/math/geometry/calcOrientedShapeFromPoints";
import {
	createEndPointArrowHead,
	createStartPointArrowHead,
} from "../../../../utils/shapes/path/createArrowHeads";
import { createDValue } from "../../../../utils/shapes/path/createDValue";
import { isItemableState } from "../../../../utils/validation/isItemableState";

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
	refBus.current = refBusVal;

	// Path pointer down event handler
	const handlePathPointerDown = useCallback(() => {
		const { isSelected, transformEnabled } = refBus.current;

		if (!transformEnabled) {
			// If transform is disabled, skip transform mode;
			setIsVerticesMode(true);
		}

		if (isSelected) {
			setIsSequentialSelection(true);
		}
	}, []);

	// Path click event handler
	const handlePathClick = useCallback((e: DiagramClickEvent) => {
		const { isSequentialSelection, isVerticesMode, transformEnabled, onClick } =
			refBus.current;

		if (isSequentialSelection && transformEnabled) {
			setIsVerticesMode(!isVerticesMode);
		}
		onClick?.(e);
	}, []);

	// Path drag event handler
	const handlePathDrag = useCallback((e: DiagramDragEvent) => {
		const { dragEnabled, onDrag, isVerticesMode } = refBus.current;

		// Disable dragging by suppressing event when drag is disabled
		if (!dragEnabled) {
			return;
		}

		// Disable dragging by suppressing event when in vertices mode
		if (isVerticesMode) {
			return;
		}

		onDrag?.(e);
	}, []);

	// Path selection state control
	useEffect(() => {
		// Clear sequential selection flag when selection is removed from group
		if (!isSelected) {
			setIsSequentialSelection(false);
			setIsVerticesMode(false);
		}
	}, [isSelected]);

	// Generate drag properties for path element.
	const dragProps = useDrag({
		id,
		type: "Path",
		x,
		y,
		ref: dragSvgRef,
		onPointerDown: handlePathPointerDown,
		onDrag: handlePathDrag,
	});

	// Generate click properties for path element.
	const clickProps = useClick({
		id,
		x,
		y,
		isSelected,
		isAncestorSelected,
		ref: dragSvgRef,
		onClick: handlePathClick,
	});

	// Generate select properties for path element.
	const selectProps = useSelect({
		id,
		onSelect,
	});

	// Compose props for path element
	const composedProps = mergeProps(dragProps, clickProps, selectProps);

	// Segment click event handler
	const handleSegmentClick = useCallback(() => {
		setIsVerticesMode(false);
	}, []);

	/**
	 * Vertex drag event handler
	 */
	const handlePathPointDrag = useCallback((e: DiagramDragEvent) => {
		if (e.eventPhase === "Started") {
			setIsPathPointDragging(true);
		}

		refBus.current.onDrag?.(e);

		if (e.eventPhase === "Ended") {
			setIsPathPointDragging(false);
		}
	}, []);

	/**
	 * Change event handler for line segments and new vertices
	 */
	const handleDiagramChangeBySegumentAndNewVertex = useCallback(
		(e: DiagramChangeEvent) => {
			if (!isItemableState<DiagramBaseData>(e.endDiagram)) return; // Type guard with DiagramBaseData

			const { rotation, scaleX, scaleY, onDiagramChange } = refBus.current;
			if (e.eventPhase === "Ended") {
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
	const showTransformGroup = showTransformControls && !isVerticesMode;

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
			<PathElement
				d={d}
				fill="none"
				stroke={stroke}
				strokeWidth={strokeWidth}
				isTransparent={false}
			/>
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
					onClick={handleSegmentClick}
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
			{/* Overall transform group */}
			{showTransformGroup && (
				<Group
					id={id}
					x={x}
					y={y}
					isSelected={showTransformControls && !isVerticesMode}
					showTransformControls={showTransformControls}
					showOutline={showOutline && !isVerticesMode}
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
