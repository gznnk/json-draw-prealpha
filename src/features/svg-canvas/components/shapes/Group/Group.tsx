// Import React.
import React, { memo, useCallback, useRef } from "react";

// Import types.
import { DiagramRegistry } from "../../../registry";
import type { DiagramChangeEvent } from "../../../types/events/DiagramChangeEvent";
import type { DiagramDragEvent } from "../../../types/events/DiagramDragEvent";
import type { GroupProps } from "../../../types/props/shapes/GroupProps";

// Import components.
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
	isDragging = false,
	showOutline = false,
	showTransformControls = false,
	isTransforming = false,
	onDrag,
	onClick,
	onSelect,
	onTransform,
	onDragEnter,
	onDragLeave,
	onHoverChange,
	onDiagramChange,
	onConnect,
	onTextChange,
	onExecute,
}) => {
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
		onDiagramChange,
		onConnect,
		onTextChange,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	/**
	 * Change event handler for shapes within the group
	 */
	const handleChildDiagramChange = useCallback((e: DiagramChangeEvent) => {
		const { id, isSelected, onDiagramChange, onDrag } = refBus.current;

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

			onDrag?.(dragEvent);
		} else {
			// When group is not selected, there is no impact on the group other than outline, so propagate the change event as is
			onDiagramChange?.(e);
		}
	}, []);

	const doShowConnectPoints =
		showConnectPoints && !isSelected && !isDragging && !isTransforming;

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
			onClick,
			onSelect,
			onDrag,
			onTransform,
			onDragEnter,
			onDragLeave,
			onHoverChange,
			onDiagramChange: handleChildDiagramChange,
			onConnect,
			onTextChange,
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
				showOutline={showOutline}
			/>
			{!isDragging && (
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
					isTransforming={isTransforming}
					onTransform={onTransform}
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

export const Group = memo(GroupComponent);
