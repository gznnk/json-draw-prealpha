import React, { memo, useMemo, useRef, useCallback } from "react";

import { CanvasFrameElement } from "./CanvasFrameStyled";
import {
	BACKGROUND_COLOR,
	BORDER_COLOR,
	BORDER_WIDTH,
	CORNER_RADIUS,
} from "../../../constants/styling/diagrams/CanvasFrameStyling";
import { useAppendDiagrams } from "../../../hooks/useAppendDiagrams";
import { useAppendSelectedDiagrams } from "../../../hooks/useAppendSelectedDiagrams";
import { useClick } from "../../../hooks/useClick";
import { useDrag } from "../../../hooks/useDrag";
import { useExecutionChain } from "../../../hooks/useExecutionChain";
import { useHover } from "../../../hooks/useHover";
import { useSelect } from "../../../hooks/useSelect";
import { DiagramRegistry } from "../../../registry";
import type { DiagramData } from "../../../types/data/core/DiagramData";
import type { DiagramDragDropEvent } from "../../../types/events/DiagramDragDropEvent";
import type { CanvasFrameProps } from "../../../types/props/diagrams/CanvasFrameProps";
import type { Diagram } from "../../../types/state/core/Diagram";
import { collectDiagramDataIds } from "../../../utils/core/collectDiagramDataIds";
import { mergeProps } from "../../../utils/core/mergeProps";
import { isObjectPayload } from "../../../utils/execution/isObjectPayload";
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
	onHoverChange,
	onDiagramChange,
	onConnect,
	onPreviewConnectLine,
	onTextChange,
	onExecute,
}) => {
	// Reference to the SVG element for interaction
	const svgRef = useRef<SVGRectElement>({} as SVGRectElement);

	// Hook for appending selected diagrams to this frame
	const appendSelectedDiagrams = useAppendSelectedDiagrams();

	// Hook for appending diagrams to this frame
	const appendDiagrams = useAppendDiagrams();

	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		id,
		items,
		appendSelectedDiagrams,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	/**
	 * Event handler when diagrams are dropped on this CanvasFrame
	 */
	const onDrop = useCallback((e: DiagramDragDropEvent) => {
		// Only handle diagram drops (not ConnectPoint drops)
		if (e.dropItem.type !== "ConnectPoint") {
			// Bypass references to avoid function creation in every render.
			const { id, items, appendSelectedDiagrams } = refBus.current;

			// Ignore drops if the dragged item is this frame itself
			if (e.dropItem.id === id) {
				return;
			}

			// Recursively collect all child IDs (including nested children)
			const allChildIds = collectDiagramDataIds(items);

			// Ignore drops if the dragged item is one of this frame's descendant diagrams
			if (allChildIds.includes(e.dropItem.id)) {
				return;
			}

			// Trigger append selected diagrams event
			appendSelectedDiagrams(id);
		}
	}, []);

	// Use individual interaction hooks
	const dragProps = useDrag({
		id,
		type: "CanvasFrame",
		x,
		y,
		ref: svgRef,
		onDrag,
		onDragOver,
		onDragLeave,
		onDrop,
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
			onHoverChange,
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
			// Handle shape data from PageDesignNode
			if (isObjectPayload(e.payload) && e.eventPhase === "InProgress") {
				const shapeData = e.payload.data as Diagram;

				// Validate that it's a valid diagram object
				if (shapeData && shapeData.id && shapeData.type) {
					// Append the received shape to this CanvasFrame
					appendDiagrams(id, [shapeData]);
				}
			}
		},
	});


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
			{children}
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
