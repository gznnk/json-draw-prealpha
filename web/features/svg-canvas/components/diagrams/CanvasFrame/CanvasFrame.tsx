import React, { memo, useMemo, useRef, useCallback, useState } from "react";

import {
	CanvasFrameElement,
	CanvasFrameDropIndicator,
} from "./CanvasFrameStyled";
import { EVENT_NAME_GROUP_SHAPES } from "../../../constants/core/EventNames";
import {
	BACKGROUND_COLOR,
	BORDER_COLOR,
	BORDER_WIDTH,
	CORNER_RADIUS,
} from "../../../constants/styling/diagrams/CanvasFrameStyling";
import { useEventBus } from "../../../context/EventBusContext";
import { useAppendDiagrams } from "../../../hooks/useAppendDiagrams";
import { useAppendSelectedDiagrams } from "../../../hooks/useAppendSelectedDiagrams";
import { useClick } from "../../../hooks/useClick";
import { useDrag } from "../../../hooks/useDrag";
import { useExecutionChain } from "../../../hooks/useExecutionChain";
import { useHover } from "../../../hooks/useHover";
import { useSelect } from "../../../hooks/useSelect";
import { DiagramRegistry } from "../../../registry";
import type { Point } from "../../../types/core/Point";
import type { DiagramData } from "../../../types/data/core/DiagramData";
import type { ItemableData } from "../../../types/data/core/ItemableData";
import type { DiagramChangeEvent } from "../../../types/events/DiagramChangeEvent";
import type { DiagramDragDropEvent } from "../../../types/events/DiagramDragDropEvent";
import type { GroupShapesEvent } from "../../../types/events/GroupShapesEvent";
import type { CanvasFrameProps } from "../../../types/props/diagrams/CanvasFrameProps";
import type { Diagram } from "../../../types/state/core/Diagram";
import { collectDiagramDataIds } from "../../../utils/core/collectDiagramDataIds";
import { mergeProps } from "../../../utils/core/mergeProps";
import { isDiagramPayload } from "../../../utils/execution/isDiagramPayload";
import { isToolPayload } from "../../../utils/execution/isToolPayload";
import { degreesToRadians } from "../../../utils/math/common/degreesToRadians";
import { createSvgTransform } from "../../../utils/shapes/common/createSvgTransform";
import { Outline } from "../../core/Outline";
import { PositionLabel } from "../../core/PositionLabel";
import { Transformative } from "../../core/Transformative";
import { ConnectPoints } from "../../shapes/ConnectPoints";

/**
 * CanvasFrame component.
 */
const CanvasFrameComponent: React.FC<CanvasFrameProps> = ({
	id,
	x,
	y,
	width,
	height,
	minWidth,
	minHeight,
	rotation,
	scaleX,
	scaleY,
	keepProportion,
	rotateEnabled,
	inversionEnabled,
	isSelected,
	isAncestorSelected,
	items,
	connectPoints,
	showConnectPoints = false,
	connectEnabled = true,
	isDragging = false,
	showOutline = false,
	showTransformControls = false,
	isTransforming = false,
	isTransparent,
	onDrag,
	onClick,
	onSelect,
	onTransform,
	onDragOver,
	onDragLeave,
	onDrop,
	onHoverChange,
	onDiagramChange,
	onConnect,
	onPreviewConnectLine,
	onTextChange,
	onExecute,
}) => {
	// Reference to the SVG element for interaction
	const svgRef = useRef<SVGRectElement>({} as SVGRectElement);

	// Get EventBus instance from context
	const eventBus = useEventBus();

	// Hook for appending selected diagrams to this frame
	const appendSelectedDiagrams = useAppendSelectedDiagrams();

	// Hook for appending diagrams to this frame
	const appendDiagrams = useAppendDiagrams();

	// State for managing drop target visual feedback
	const [isDropTarget, setIsDropTarget] = useState(false);

	// Create reference to store the origin point for diagram placement
	const origin = useRef<Point>({ x: 0, y: 0 });

	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		id,
		items,
		appendSelectedDiagrams,
		onDragOver,
		onDragLeave,
		onDrop,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	const canAcceptDrop = useCallback((event: DiagramDragDropEvent) => {
		if (event.dropItem.type === "ConnectPoint") {
			return false;
		}

		const { id: currentId, items: currentItems } = refBus.current;

		if (event.dropItem.id === currentId) {
			return false;
		}

		const allChildIds = collectDiagramDataIds(currentItems);
		return !allChildIds.has(event.dropItem.id);
	}, []);

	/**
	 * Event handler when diagrams are dropped on this CanvasFrame
	 */
	const handleDrop = useCallback(
		(event: DiagramDragDropEvent) => {
			setIsDropTarget(false);

			if (!canAcceptDrop(event)) {
				refBus.current.onDrop?.(event);
				return;
			}

			const { id: currentId, appendSelectedDiagrams } = refBus.current;
			appendSelectedDiagrams(currentId);

			refBus.current.onDrop?.(event);
		},
		[canAcceptDrop],
	);

	const handleDragOver = useCallback(
		(event: DiagramDragDropEvent) => {
			const droppable = canAcceptDrop(event);
			setIsDropTarget(droppable);

			refBus.current.onDragOver?.(event);
		},
		[canAcceptDrop],
	);

	const handleDragLeave = useCallback((event: DiagramDragDropEvent) => {
		setIsDropTarget(false);

		refBus.current.onDragLeave?.(event);
	}, []);

	// Use individual interaction hooks
	const dragProps = useDrag({
		id,
		type: "CanvasFrame",
		x,
		y,
		ref: svgRef,
		onDrag,
		onDragOver: handleDragOver,
		onDragLeave: handleDragLeave,
		onDrop: handleDrop,
	});

	const clickProps = useClick({
		id,
		x,
		y,
		isSelected,
		isAncestorSelected,
		ref: svgRef,
		onClick,
	});

	const selectProps = useSelect({
		id,
		onSelect,
	});

	const hoverProps = useHover({
		id,
		onHoverChange,
	});

	// Handler to propagate child hover events to this frame
	const handleChildHoverChange = useCallback(
		(e: { eventId: string; id: string; isHovered: boolean }) => {
			// Propagate child hover event to parent
			onHoverChange?.(e);
			// Also fire hover event for this frame when child is hovered
			onHoverChange?.({
				eventId: e.eventId,
				id,
				isHovered: e.isHovered,
			});
		},
		[id, onHoverChange],
	);

	// Compose props for the background element using mergeProps
	const composedProps = mergeProps(
		dragProps,
		clickProps,
		selectProps,
		hoverProps,
	);

	// Generate rect transform attribute
	const transform = createSvgTransform(
		scaleX,
		scaleY,
		degreesToRadians(rotation),
		x,
		y,
	);

	// Suppress ConnectPoint re-rendering by memoization
	// If separated by key and passed as individual props, each ConnectPoint side
	// performs comparison processing for each key which is inefficient, so detect Shape differences collectively here
	const ownerFrame = useMemo(
		() => ({
			x,
			y,
			width,
			height,
			rotation,
			scaleX,
			scaleY,
		}),
		[x, y, width, height, rotation, scaleX, scaleY],
	);

	// Create shapes within the canvas frame
	const children = items.map((item: DiagramData) => {
		// Ensure that item.type is of DiagramType
		if (!item.type) {
			console.error("Item has no type", item);
			return null;
		}
		const component = DiagramRegistry.getComponent(item.type);
		if (!component) {
			console.warn(`Component not found for type: ${item.type}`);
			return null;
		}
		const props = {
			...item,
			key: item.id,
			onClick,
			onSelect,
			onDrag,
			onTransform,
			onDragOver,
			onDragLeave,
			onHoverChange: handleChildHoverChange,
			onDiagramChange,
			onConnect,
			onPreviewConnectLine,
			onTextChange,
			onExecute,
		};

		return React.createElement(component, props);
	});

	// Hook for receiving execution results from connected nodes (like PageDesignNode)
	useExecutionChain({
		id,
		onPropagation: async (e) => {
			if (e.eventPhase === "Started") {
				// Set origin for placing incoming diagrams
				origin.current = {
					x: x - width / 2,
					y: y - height / 2,
				};

				// Notify start of execution
				onExecute?.({
					id,
					eventId: e.eventId,
					eventPhase: "Started",
					payload: {
						format: "text",
						data: "",
					},
				});

				// Clean up existing items
				const changeDiagramEvent: DiagramChangeEvent<ItemableData> = {
					id,
					eventId: e.eventId,
					eventPhase: "Started",
					startDiagram: {
						items,
					},
					endDiagram: {
						items: [],
					},
				};
				onDiagramChange?.(changeDiagramEvent);
				onDiagramChange?.({
					...changeDiagramEvent,
					eventPhase: "Ended",
				});
			}

			if (e.eventPhase === "InProgress") {
				// Handle shape data from PageDesignNode
				if (isDiagramPayload(e.payload)) {
					const shapeData = e.payload.data as Diagram;

					// Validate that it's a valid diagram object
					if (shapeData && shapeData.id && shapeData.type) {
						// Append the received shape to this CanvasFrame
						appendDiagrams(
							id,
							[
								{
									...shapeData,
									x: shapeData.x + origin.current.x,
									y: shapeData.y + origin.current.y,
								},
							],
							true,
						);
					}
				} else if (isToolPayload(e.payload)) {
					// TODO: カスタムフック化
					// Handle tool execution results (e.g., group_shapes)
					const toolData = e.payload.data as {
						shapeIds: string[];
						groupId: string;
						name?: string;
						description?: string;
					};

					// Dispatch GROUP_SHAPES event to group the shapes
					if (
						toolData &&
						Array.isArray(toolData.shapeIds) &&
						toolData.shapeIds.length >= 2 &&
						toolData.groupId
					) {
						const groupEvent: GroupShapesEvent = {
							eventId: e.eventId,
							shapeIds: toolData.shapeIds,
							groupId: toolData.groupId,
							name: toolData.name,
							description: toolData.description,
						};

						eventBus.dispatchEvent(
							new CustomEvent(EVENT_NAME_GROUP_SHAPES, { detail: groupEvent }),
						);
					}
				}
			}

			if (e.eventPhase === "Ended") {
				onExecute?.({
					id,
					eventId: e.eventId,
					eventPhase: "Ended",
					payload: {
						format: "object",
						data: items,
					},
				});
			}
		},
	});

	// Calculate viewBox for clipping content to frame bounds
	// Using absolute coordinates: x - width/2, y - height/2, width, height
	const viewBox = `${x - width / 2} ${y - height / 2} ${width} ${height}`;

	return (
		<>
			<CanvasFrameElement
				id={id}
				x={-width / 2}
				y={-height / 2}
				width={width}
				height={height}
				rx={CORNER_RADIUS}
				ry={CORNER_RADIUS}
				fill={BACKGROUND_COLOR}
				stroke={BORDER_COLOR}
				strokeWidth={BORDER_WIDTH}
				isTransparent={isTransparent}
				tabIndex={0}
				cursor="move"
				transform={transform}
				ref={svgRef}
				{...composedProps}
			/>
			<CanvasFrameDropIndicator
				id={`${id}-drop-indicator`}
				x={-width / 2}
				y={-height / 2}
				width={width}
				height={height}
				rx={CORNER_RADIUS}
				ry={CORNER_RADIUS}
				transform={transform}
				isActive={isDropTarget}
			/>
			<svg
				x={-width / 2}
				y={-height / 2}
				width={width}
				height={height}
				viewBox={viewBox}
				transform={transform}
				overflow="hidden"
			>
				{children}
			</svg>
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
			{!isDragging && (
				<Transformative
					id={id}
					type="CanvasFrame"
					x={x}
					y={y}
					width={width}
					height={height}
					minWidth={minWidth}
					minHeight={minHeight}
					rotation={rotation}
					scaleX={scaleX}
					scaleY={scaleY}
					keepProportion={keepProportion}
					rotateEnabled={rotateEnabled}
					inversionEnabled={inversionEnabled}
					showTransformControls={showTransformControls}
					isTransforming={isTransforming}
					onTransform={onTransform}
				/>
			)}
			{connectPoints && (
				<ConnectPoints
					ownerId={id}
					ownerFrame={ownerFrame}
					connectPoints={connectPoints}
					showConnectPoints={showConnectPoints}
					shouldRender={!isDragging && !isTransforming && !isSelected}
					connectEnabled={connectEnabled}
					onConnect={onConnect}
					onPreviewConnectLine={onPreviewConnectLine}
				/>
			)}
			{isSelected && isDragging && (
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

export const CanvasFrame = memo(CanvasFrameComponent);
