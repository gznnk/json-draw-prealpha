// Import React.
import React, { memo, useCallback, useEffect, useRef, useState } from "react";

// Import types.
import type { Diagram } from "../../../types/data/catalog/Diagram";
import { DiagramRegistry } from "../../../registry";
import type { DiagramChangeEvent } from "../../../types/events/DiagramChangeEvent";
import type { DiagramConnectEvent } from "../../../types/events/DiagramConnectEvent";
import type { DiagramDragEvent } from "../../../types/events/DiagramDragEvent";
import type { DiagramSelectEvent } from "../../../types/events/DiagramSelectEvent";
import type { DiagramTextEditEvent } from "../../../types/events/DiagramTextEditEvent";
import type { DiagramTransformEvent } from "../../../types/events/DiagramTransformEvent";
import type { GroupProps } from "../../../types/props/shapes/GroupProps";

// Import components related to SvgCanvas.
import { PositionLabel } from "../../core/PositionLabel";
import { Outline } from "../../core/Outline";
import { Transformative } from "../../core/Transformative";

// Import utils.
import { degreesToRadians } from "../../../utils/math/common/degreesToRadians";
import { isItemableData } from "../../../utils/validation/isItemableData";
import { isTransformativeData } from "../../../utils/validation/isTransformativeData";
import { rotatePoint } from "../../../utils/math/points/rotatePoint";

// Imports related to this component.
import { getSelectedChildDiagram } from "../../../utils/shapes/group/getSelectedChildDiagram";

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
	isMultiSelectSource,
	items,
	showConnectPoints = true,
	showOutline = false,
	syncWithSameId = false,
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

	// Flag for sequential selection.
	// Sequential selection refers to the operation of selecting shape within the same group in succession,
	// even if the shape are not the same.
	// This is set to true only when the group is already selected and the pointer is pressed again on a shape inside the group.
	const isSequentialSelection = useRef(false);

	// List of child shapes at the start of a drag or transform.
	const startItems = useRef<Diagram[]>(items);

	// Group's oriented box at the start of a drag or transform.
	const startBox = useRef({ x, y, width, height });
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
		onClick,
		onSelect,
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
	 * Selection event handler for shapes within the group
	 */
	const handleChildDiagramSelect = useCallback((e: DiagramSelectEvent) => {
		const { id, isSelected, items, onSelect } = refBus.current;
		const selectedChild = getSelectedChildDiagram(items);
		if (!selectedChild) {
			// If no shape in the group is selected, fire the selection event for this group.
			// This way, when no shape in the group is selected, the event from the topmost group
			// is propagated to SvgCanvas, and that group becomes selected.
			onSelect?.({
				eventId: e.eventId,
				id,
			});
		} else if (selectedChild.id !== e.id) {
			// If a shape in the group is selected and a different shape in the group is selected, make that shape selected
			onSelect?.(e);
		}

		if (isSelected) {
			// When a group is continuously selected and clicked, we want to make the clicked shape within the group selected
			// for interactive purposes, so we set a flag and reference it in the click event.
			isSequentialSelection.current = true;
		}
	}, []);
	/**
	 * Click event handler for shapes within the group
	 */
	const handleChildDiagramClick = useCallback((e: DiagramSelectEvent) => {
		const { id, onSelect, onClick } = refBus.current;

		if (isSequentialSelection.current) {
			// If it's during interactive group sequential selection, make the clicked shape in that group selected.
			// This way, when groups are nested, the selection hierarchy goes down one level at a time, and finally the clicked shape is selected.
			onSelect?.(e);
			isSequentialSelection.current = false;
		} else {
			// If it's not during group sequential selection, fire the click event for this group.
			// This way, when it's not for sequential selection of groups, the click event from the topmost group
			// is propagated to the sequentially selected group, and the sequential selection processing for that group (the true side) is executed,
			// and the group directly below it becomes selected.
			onClick?.({
				eventId: e.eventId,
				id,
			});
		}
	}, []);

	// Group selection state control
	useEffect(() => {
		// Clear sequential selection flag when selection is removed from group
		if (!isSelected) {
			isSequentialSelection.current = false;
		}
	}, [isSelected]);

	/**
	 * Drag event handler for shapes within the group
	 */
	const handleChildDiagramDrag = useCallback((e: DiagramDragEvent) => {
		const { isSelected, onDrag } = refBus.current;

		// Processing at drag start
		if (e.eventType === "Start") {
			if (isSelected) {
				// If in group selection, enable dragging of the entire group
				setIsGroupDragging(true);
			}
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
		const { id, x, y, width, height, items, onDiagramChange } = refBus.current;

		// Processing at group transform start
		if (e.eventType === "Start") {
			// Record the group's shape at transform start
			startBox.current = { x, y, width, height };
			startItems.current = items;

			// Nothing has been transformed yet, so only send start notification
			onDiagramChange?.({
				eventId: e.eventId,
				eventType: "Start",
				changeType: "Transform",
				id,
				startDiagram: {
					...e.startShape,
					items,
				},
				endDiagram: {
					...e.endShape,
					items,
				},
				cursorX: e.cursorX,
				cursorY: e.cursorY,
			});

			setIsGroupTransforming(true);
			return;
		}

		// Following processing for during group transform and transform end

		// Calculate group scaling
		const groupScaleX = e.endShape.width / e.startShape.width;
		const groupScaleY = e.endShape.height / e.startShape.height;

		// Recursively transform shapes within the group (including connection points)
		const transformRecursive = (diagrams: Diagram[]) => {
			const newItems: Diagram[] = [];
			for (const item of diagrams) {
				const inversedItemCenter = rotatePoint(
					item.x,
					item.y,
					e.startShape.x,
					e.startShape.y,
					degreesToRadians(-e.startShape.rotation),
				);
				const dx =
					(inversedItemCenter.x - e.startShape.x) *
					e.startShape.scaleX *
					e.endShape.scaleX;
				const dy =
					(inversedItemCenter.y - e.startShape.y) *
					e.startShape.scaleY *
					e.endShape.scaleY;

				const newDx = dx * groupScaleX;
				const newDy = dy * groupScaleY;

				let newCenter = {
					x: e.endShape.x + newDx,
					y: e.endShape.y + newDy,
				};
				newCenter = rotatePoint(
					newCenter.x,
					newCenter.y,
					e.endShape.x,
					e.endShape.y,
					degreesToRadians(e.endShape.rotation),
				);

				if (isTransformativeData(item)) {
					const rotationDiff = e.endShape.rotation - e.startShape.rotation;
					const newRotation = item.rotation + rotationDiff;

					newItems.push({
						...item,
						x: newCenter.x,
						y: newCenter.y,
						width: item.width * groupScaleX,
						height: item.height * groupScaleY,
						rotation: newRotation,
						scaleX: e.endShape.scaleX,
						scaleY: e.endShape.scaleY,
						items: isItemableData(item)
							? transformRecursive(item.items ?? [])
							: undefined,
					} as Diagram);
				} else {
					newItems.push({
						...item,
						x: newCenter.x,
						y: newCenter.y,
					});
				}
			}

			return newItems;
		};

		const event: DiagramChangeEvent = {
			eventId: e.eventId,
			eventType: e.eventType,
			changeType: "Transform",
			id,
			startDiagram: {
				...e.startShape,
				items: startItems.current,
			},
			endDiagram: {
				...e.endShape,
				items: transformRecursive(startItems.current),
			},
			cursorX: e.cursorX,
			cursorY: e.cursorY,
		};
		// Notify the transformation of all shapes in the group collectively
		onDiagramChange?.(event);

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
			syncWithSameId,
			onClick: handleChildDiagramClick,
			onSelect: handleChildDiagramSelect,
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
				isMultiSelectSource={isMultiSelectSource}
			/>
			{!isMultiSelectSource && !isGroupDragging && (
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
					isSelected={isSelected}
					isMultiSelectSource={isMultiSelectSource}
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
