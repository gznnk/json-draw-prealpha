import type React from "react";
import { memo, useCallback, useRef, useState } from "react";

import type { DiagramChangeEvent } from "../../../../types/events/DiagramChangeEvent";
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
import { calcOrientedFrameFromPoints } from "../../../../utils/math/geometry/calcOrientedFrameFromPoints";
import { convertStrokeDashTypeToArray } from "../../../../utils/shapes/common/convertStrokeDashTypeToArray";
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
	dragType = "whole",
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
		dragType,
		items,
		onDrag,
		onSelect,
		onClick,
		onDiagramChange,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	// Path drag event handler
	const handlePathDrag = useCallback((e: DiagramDragEvent) => {
		const { dragType, onDrag } = refBus.current;

		// Only allow whole path dragging for "whole" type
		if (dragType === "whole") {
			onDrag?.(e);
		}
	}, []);

	// Generate drag properties for path element.
	const dragProps = useDrag({
		id,
		type: "Path",
		x,
		y,
		ref: dragSvgRef,
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
		onClick,
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
			!isSelected ||
			(fixBothEnds && isBothEnds(idx)) ||
			Boolean(draggingPathPointId && item.id !== draggingPathPointId),
	}));

	// Display flag for dragging line segments
	const showSegmentList =
		isSelected &&
		!draggingPathPointId &&
		(dragType === "segment" || dragType === "segment-right-angle");

	// Display flag for new vertices
	const showNewVertex = isSelected && !draggingPathPointId;

	// Display flag for path points
	const showPathPoints = isSelected;

	// Display flag for dashed guide lines (Bézier mode + selected)
	const showDashedGuideLines =
		pathType === "Bezier" && isSelected && !draggingPathPointId;

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
				cursor={dragType === "whole" ? "move" : "pointer"}
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
					rightAngleSegmentDrag={dragType === "segment-right-angle"}
					fixBothEnds={fixBothEnds}
					items={items}
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
