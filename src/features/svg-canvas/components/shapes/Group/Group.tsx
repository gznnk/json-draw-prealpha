// Import React.
import React, { memo, useCallback, useRef, useState } from "react";

// Import types.
import { DiagramRegistry } from "../../../registry";
import type { DiagramChangeEvent } from "../../../types/events/DiagramChangeEvent";
import type { DiagramConnectEvent } from "../../../types/events/DiagramConnectEvent";
import type { DiagramDragEvent } from "../../../types/events/DiagramDragEvent";
import type { DiagramTextEditEvent } from "../../../types/events/DiagramTextEditEvent";
import type { DiagramTransformEvent } from "../../../types/events/DiagramTransformEvent";
import type { GroupProps } from "../../../types/props/shapes/GroupProps";

// Import components related to SvgCanvas.
import { PositionLabel } from "../../core/PositionLabel";
import { Outline } from "../../core/Outline";
import { Transformative } from "../../core/Transformative";

/**
 * Group component.
 */
const GroupComponent: React.FC<GroupProps> = ({
	id,
	x,
	y,
	width,
	height,
	rotation,
	scaleX,
	scaleY,
	keepProportion,
	isSelected,
	items,
	showConnectPoints = true,
	showOutline = false,
	showTransformControls = false,
	onDrag,
	onClick,
	onSelect,
	onTransform,
	onDiagramChange,
	onConnect,
	onTextEdit,
	onExecute,
}) => {
	// Flag indicating whether the entire group is being dragged.
	// Set to true only when this group is selected and currently being dragged.
	const [isGroupDragging, setIsGroupDragging] = useState(false);
	// Flag indicating whether the entire group is being transformed.
	const [isGroupTransforming, setIsGroupTransforming] = useState(false);
	// To avoid frequent handler generation, hold referenced values in useRef
	const refBusVal = {
		// Properties
		id,
		x,
		y,
		width,
		height,
		isSelected,
		items,
		onDrag,
		onTransform,
		onDiagramChange,
		onConnect,
		onTextEdit,
		// Internal variables and functions
		isGroupDragging,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	/**
	 * Drag event handler for shapes within the group
	 */
	const handleChildDiagramDrag = useCallback((e: DiagramDragEvent) => {
		const { isSelected, onDrag } = refBus.current;

		// Processing at drag start
		if (e.eventType === "Start" && isSelected) {
			// If in group selection, enable dragging of the entire group
			setIsGroupDragging(true);
		}

		// Processing during drag
		onDrag?.(e);

		// Clear the dragging flag at drag end
		if (e.eventType === "End") {
			setIsGroupDragging(false);
		}
	}, []);

	/**
	 * Transform event handler for shapes within the group
	 */
	const handleChildDiagramTransfrom = useCallback(
		(e: DiagramTransformEvent) => {
			const { onTransform } = refBus.current;

			// Propagate the transform event as is
			// Outline update is done on the Canvas side, so nothing is done here
			onTransform?.(e);
		},
		[],
	);
	/**
	 * Change event handler for shapes within the group
	 */
	const handleChildDiagramChange = useCallback(
		(e: DiagramChangeEvent) => {
			const { id, isSelected, onDiagramChange } = refBus.current;

			if (isSelected) {
				// TODO: Check if this logic is necessary
				// When group is selected, operations that come here are equivalent to drag operations, so convert to drag event and propagate
				const dragEvent = {
					eventType: e.eventType,
					id,
					startX: e.startDiagram.x,
					startY: e.startDiagram.y,
					endX: e.endDiagram.x,
					endY: e.endDiagram.y,
				} as DiagramDragEvent;

				handleChildDiagramDrag(dragEvent);
			} else {
				// When group is not selected, there is no impact on the group other than outline, so propagate the change event as is
				onDiagramChange?.(e);
			}
		},
		[handleChildDiagramDrag],
	);
	/**
	 * Connection event handler for shapes within the group
	 */
	const handleChildDiagramConnect = useCallback((e: DiagramConnectEvent) => {
		const { onConnect } = refBus.current;

		// Nothing special to do, just propagate as is
		onConnect?.(e);
	}, []);
	/**
	 * Text edit event handler for shapes within the group
	 */
	const handleChildDiagramTextEdit = useCallback((e: DiagramTextEditEvent) => {
		const { onTextEdit } = refBus.current;

		// Propagate the text edit event for shapes within the group as is
		onTextEdit?.(e);
	}, []);

	/**
	 * Group transform event handler
	 */
	const handleTransform = useCallback((e: DiagramTransformEvent) => {
		const { onTransform } = refBus.current;

		// Processing at group transform start
		if (e.eventType === "Start") {
			setIsGroupTransforming(true);
		}

		// Propagate the transform event to canvas.
		// The recursive transformation of child items is now handled by useTransform hook.
		onTransform?.(e);

		if (e.eventType === "End") {
			setIsGroupTransforming(false);
		}
	}, []);

	const doShowConnectPoints =
		showConnectPoints &&
		!isSelected &&
		!isGroupDragging &&
		!isGroupTransforming;
	// Create shapes within the group
	const children = items.map((item) => {
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
			showConnectPoints: doShowConnectPoints,
			// Show outline on child elements when group is selected or when parent requests outline display for child elements
			showOutline: isSelected || showOutline,
			onClick,
			onSelect,
			onDrag: handleChildDiagramDrag,
			onTransform: handleChildDiagramTransfrom,
			onDiagramChange: handleChildDiagramChange,
			onConnect: handleChildDiagramConnect,
			onTextEdit: handleChildDiagramTextEdit,
			onExecute,
		};

		return React.createElement(component(), props);
	});
	return (
		<>
			{children}
			<Outline
				x={x}
				y={y}
				width={width}
				height={height}
				rotation={rotation}
				scaleX={scaleX}
				scaleY={scaleY}
				isSelected={isSelected}
				showOutline={showOutline}
			/>
			{!isGroupDragging && (
				<Transformative
					id={id}
					type="Group"
					x={x}
					y={y}
					width={width}
					height={height}
					rotation={rotation}
					scaleX={scaleX}
					scaleY={scaleY}
					keepProportion={keepProportion}
					showTransformControls={showTransformControls}
					onTransform={handleTransform}
				/>
			)}
			{isSelected && isGroupDragging && (
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

export const Group = memo(GroupComponent);
