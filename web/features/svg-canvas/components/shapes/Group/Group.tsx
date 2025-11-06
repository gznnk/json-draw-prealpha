import React, { memo } from "react";

import { DiagramRegistry } from "../../../registry";
import type { GroupProps } from "../../../types/props/shapes/GroupProps";
import { PositionLabel } from "../../core/PositionLabel";

/**
 * Group component.
 */
const GroupComponent: React.FC<GroupProps> = ({
	x,
	y,
	width,
	height,
	rotation,
	scaleX,
	scaleY,
	isSelected,
	items,
	isDragging = false,
	onDrag,
	onClick,
	onSelect,
	onDragOver,
	onDragLeave,
	onHoverChange,
	onDiagramChange,
	onConnect,
	onPreviewConnectLine,
	onTextChange,
	onExecute,
}) => {
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
			onClick,
			onSelect,
			onDrag,
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

	return (
		<>
			{children}
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
