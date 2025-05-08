// Import React.
import type React from "react";
import { memo, useCallback, useRef, useState } from "react";

// Import types related to ImageCanvas.
import type {
	DiagramDragEvent,
	DiagramPointerEvent,
} from "../../../types/EventTypes";

// Import components related to ImageCanvas.
import { PositionLabel } from "../../core/PositionLabel";
import { Transformative } from "../../core/Transformative";

// Import hooks related to ImageCanvas.
import { useDrag } from "../../../hooks/useDrag";

// Import functions related to ImageCanvas.
import { createSvgTransform } from "../../../utils/diagram_t";
import { degreesToRadians } from "../../../utils";

// Imports related to this component.
import type { ImageProps } from "./ImageTypes";

/**
 * Image component.
 */
const ImageComponent: React.FC<ImageProps> = ({
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
	syncWithSameId = false,
	base64Data,
	onDrag,
	onClick,
	onSelect,
	onTransform,
}) => {
	// Is the element being dragged.
	const [isDragging, setIsDragging] = useState(false);
	// Reference to the element.
	const svgRef = useRef<SVGImageElement>({} as SVGImageElement);

	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		id,
		isSelected,
		onDrag,
		onSelect,
		onTransform,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	/**
	 * Handler for drag events.
	 */
	const handleDrag = useCallback((e: DiagramDragEvent) => {
		const { onDrag } = refBus.current;

		if (e.eventType === "Start") {
			setIsDragging(true);
		}

		onDrag?.(e);

		if (e.eventType === "End") {
			setIsDragging(false);
		}
	}, []);

	/**
	 * Handler for pointer down events.
	 */
	const handlePointerDown = useCallback((e: DiagramPointerEvent) => {
		const { id, onSelect } = refBus.current;

		// Trigger the select event when the pointer is down.
		onSelect?.({
			eventId: e.eventId,
			id,
		});
	}, []);

	// Prepare props for the drag element.
	const dragProps = useDrag({
		id,
		type: "Rectangle",
		x,
		y,
		syncWithSameId,
		ref: svgRef,
		onPointerDown: handlePointerDown,
		onClick: onClick,
		onDrag: handleDrag,
	});

	// Create the transform attribute for the element.
	const transform = createSvgTransform(
		scaleX,
		scaleY,
		degreesToRadians(rotation),
		x,
		y,
	);

	// Flag to show the transformative element.
	const showTransformative = isSelected && !isMultiSelectSource && !isDragging;

	return (
		<>
			<g transform={transform}>
				<image
					className="diagram"
					id={id}
					x={-width / 2}
					y={-height / 2}
					width={width}
					height={height}
					tabIndex={0}
					cursor="move"
					href={`data:image/png;base64,${base64Data}`}
					ref={svgRef}
					{...dragProps}
				/>
			</g>
			{showTransformative && (
				<Transformative
					id={id}
					type="Rectangle"
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

export const Image = memo(ImageComponent);
