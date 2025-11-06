import type React from "react";
import { memo, useCallback, useEffect, useRef, useState } from "react";

import type { PathMode } from "./PathTypes";
import type { DiagramChangeEvent } from "../../../../types/events/DiagramChangeEvent";
import type { DiagramClickEvent } from "../../../../types/events/DiagramClickEvent";
import type { DiagramDragEvent } from "../../../../types/events/DiagramDragEvent";
import type { PathProps } from "../../../../types/props/shapes/PathProps";
import type { PathState } from "../../../../types/state/shapes/PathState";
import { mergeProps } from "../../../../utils/core/mergeProps";
import { getMarkerUrl } from "../../../../utils/shapes/path/getMarkerUrl";
import { PositionLabel } from "../../../core/PositionLabel";
import { NewVertexList } from "../NewVertexList";
import { PathPoint } from "../PathPoint";
import { SegmentList } from "../SegmentList";
import { PathElement } from "./PathStyled";
import { useClick } from "../../../../hooks/useClick";
import { useDrag } from "../../../../hooks/useDrag";
import { useSelect } from "../../../../hooks/useSelect";
import { useTransformControl } from "../../../../hooks/useTransformControl";
import { calcOrientedFrameFromPoints } from "../../../../utils/math/geometry/calcOrientedFrameFromPoints";
import { convertStrokeDashTypeToArray } from "../../../../utils/shapes/common/convertStrokeDashTypeToArray";
import { isPointerOver } from "../../../../utils/shapes/common/isPointerOver";
import { createDValue } from "../../../../utils/shapes/path/createDValue";
import { createPathDValue } from "../../../../utils/shapes/path/createPathDValue";
import { isItemableData } from "../../../../utils/validation/isItemableData";

/**
 * Path component
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
	stroke = "black",
	strokeWidth = 1,
	strokeDashType = "solid",
	isSelected = false,
	isAncestorSelected = false,
	isDragging = false,
	items = [],
	pathType,
	dragEnabled = true,
	transformEnabled = true,
	verticesModeEnabled = true,
	rightAngleSegmentDrag = false,
	fixBothEnds = false,
	startArrowHead = "None",
	endArrowHead = "None",
	onClick,
	onDrag,
	onSelect,
	onDiagramChange,
}) => {
	const [draggingPathPointId, setDraggingPathPointId] = useState<string | null>(
		null,
	);
	const [isSequentialSelection, setIsSequentialSelection] = useState(false);
	const [mode, setMode] = useState<PathMode>("Inactive");

	const dragSvgRef = useRef<SVGPathElement>({} as SVGPathElement);

	const startDiagram = useRef<Partial<PathState> | null>(null);

	// To avoid frequent handler generation, hold referenced values in useRef
	const refBusVal = {
		// Properties
		id,
		x,
		y,
		width,
		height,
		rotation,
		scaleX,
		scaleY,
		isSelected,
		dragEnabled,
		transformEnabled,
		verticesModeEnabled,
		items,
		onDrag,
		onSelect,
		onClick,
		onDiagramChange,
		// Internal variables and functions
		isSequentialSelection,
		mode,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	// Path pointer down event handler
	const handlePathPointerDown = useCallback(() => {
		const { isSelected } = refBus.current;

		if (isSelected) {
			setIsSequentialSelection(true);
		}
	}, []);

	// Path click event handler
	const handlePathClick = useCallback((e: DiagramClickEvent) => {
		const { isSequentialSelection, verticesModeEnabled, onClick } =
			refBus.current;

		if (isSequentialSelection && verticesModeEnabled) {
			setMode("Vertices");
		}
		onClick?.(e);
	}, []);

	// Transform control click event handler
	const handleTransformControlClick = useCallback(
		(e: { clientX: number; clientY: number }) => {
			const { verticesModeEnabled } = refBus.current;

			// Switch to Vertices mode when transform control is clicked on the path itself
			if (
				verticesModeEnabled &&
				isPointerOver(dragSvgRef, e.clientX, e.clientY)
			) {
				setMode("Vertices");
			}
		},
		[],
	);

	// Listen for transform control click events and manage visibility
	const { setShowTransformControl } = useTransformControl({
		id,
		ref: dragSvgRef,
		onTransformControlClick: handleTransformControlClick,
	});

	// Path drag event handler
	const handlePathDrag = useCallback((e: DiagramDragEvent) => {
		const { dragEnabled, onDrag, mode } = refBus.current;

		// Disable dragging by suppressing event when drag is disabled
		if (!dragEnabled) {
			return;
		}

		// Disable dragging by suppressing event when not in transform mode
		if (mode !== "Transform") {
			return;
		}

		onDrag?.(e);
	}, []);

	// Path selection state control
	useEffect(() => {
		if (isSelected) {
			if (transformEnabled) {
				setMode("Transform");
			} else {
				// If transform is disabled, skip transform mode;
				setMode("Vertices");
			}
		} else {
			setIsSequentialSelection(false);
			setMode("Inactive");
		}
	}, [isSelected, transformEnabled]);

	// Control transform control visibility based on mode
	useEffect(() => {
		// Show transform controls only when NOT in Vertices mode
		setShowTransformControl(mode !== "Vertices");
	}, [mode, setShowTransformControl]);

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

	/**
	 * Vertex drag event handler
	 */
	const handlePathPointDrag = useCallback((e: DiagramDragEvent) => {
		const { id, items, onDiagramChange } = refBus.current;

		if (e.eventPhase === "Started") {
			setDraggingPathPointId(e.id);
			startDiagram.current = {
				items,
			};
		}

		if (startDiagram.current === null) return;

		onDiagramChange?.({
			id,
			eventId: e.eventId,
			eventPhase: e.eventPhase,
			startDiagram: startDiagram.current,
			endDiagram: {
				items: items.map((item) => {
					if (e.id === item.id) {
						return {
							...item,
							x: e.endX,
							y: e.endY,
						};
					}
					return item;
				}),
			} as PathState,
			minX: e.minX,
			minY: e.minY,
		});

		if (e.eventPhase === "Ended") {
			setDraggingPathPointId(null);
		}
	}, []);

	// Segment click event handler
	const handleSegmentClick = useCallback(() => {
		if (transformEnabled) {
			setMode("Transform");
		}
	}, [transformEnabled]);

	/**
	 * Change event handler for line segments and new vertices
	 */
	const handleDiagramChangeForVertexAndSegmentDrag = useCallback(
		(e: DiagramChangeEvent) => {
			if (!isItemableData(e.endDiagram)) return; // Type guard with DiagramBaseData

			const { rotation, scaleX, scaleY, onDiagramChange } = refBus.current;
			if (e.eventPhase === "Ended") {
				// Calculate new shape of Path's bounding box when new vertex and segment dragging is completed
				const newFrame = calcOrientedFrameFromPoints(
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
						x: newFrame.x,
						y: newFrame.y,
						width: newFrame.width,
						height: newFrame.height,
					} as PathState,
				});
			} else {
				onDiagramChange?.(e);
			}
		},
		[],
	);

	// Generate polyline d attribute value
	const d = createPathDValue(items, pathType);

	// Generate vertex information
	const isBothEnds = (idx: number) => idx === 0 || idx === items.length - 1;

	const linePoints = items.map((item, idx) => ({
		...item,
		hidden:
			mode !== "Vertices" ||
			(fixBothEnds && isBothEnds(idx)) ||
			Boolean(draggingPathPointId && item.id !== draggingPathPointId),
	}));

	// Display flag for dragging line segments
	const showSegmentList = mode === "Vertices" && !draggingPathPointId;

	// Display flag for new vertices
	const showNewVertex = mode === "Vertices" && !draggingPathPointId;

	// Display flag for path points
	const showPathPoints = mode === "Vertices";

	// Display flag for dashed guide lines (Bézier mode + Vertices mode)
	const showDashedGuideLines =
		pathType === "Bezier" && mode === "Vertices" && !draggingPathPointId;

	// Flag to show the position label.
	const showPositionLabel = isSelected && isDragging;

	// Convert strokeDashType to strokeDasharray value
	const strokeDasharray = convertStrokeDashTypeToArray(strokeDashType);

	return (
		<>
			{/* Path for drawing */}
			<PathElement
				d={d}
				fill="none"
				stroke={stroke}
				strokeWidth={strokeWidth}
				strokeDasharray={strokeDasharray}
				isTransparent={false}
				markerStart={getMarkerUrl(startArrowHead)}
				markerEnd={getMarkerUrl(endArrowHead)}
			/>
			{/* Path for dragging */}
			<path
				id={id}
				d={d}
				fill="none"
				stroke="transparent"
				strokeWidth={Math.max(5, strokeWidth)}
				cursor={dragEnabled ? "move" : "pointer"}
				tabIndex={0}
				ref={dragSvgRef}
				{...composedProps}
			/>
			{/* Dashed guide lines for Bézier curves in vertices mode */}
			{showDashedGuideLines && (
				<path
					d={createDValue(items)}
					fill="none"
					stroke="rgba(24, 144, 255, 0.8)"
					strokeWidth={1}
					strokeDasharray="4,2"
					pointerEvents="none"
				/>
			)}
			{/* Line segment dragging */}
			{showSegmentList && (
				<SegmentList
					id={id}
					rightAngleSegmentDrag={rightAngleSegmentDrag}
					fixBothEnds={fixBothEnds}
					items={items}
					onClick={handleSegmentClick}
					onDiagramChange={handleDiagramChangeForVertexAndSegmentDrag}
				/>
			)}
			{/* New vertices */}
			{showNewVertex && (
				<NewVertexList
					id={id}
					items={items}
					onDiagramChange={handleDiagramChangeForVertexAndSegmentDrag}
				/>
			)}
			{/* Path points for vertices mode */}
			{showPathPoints &&
				linePoints.map((point) => (
					<PathPoint
						key={point.id}
						id={point.id}
						x={point.x}
						y={point.y}
						hidden={point.hidden}
						onDrag={handlePathPointDrag}
					/>
				))}
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
