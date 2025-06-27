// Import React.
import type React from "react";
import { memo, useCallback, useRef, useState } from "react";

// Import types.
import type { DiagramDragEvent } from "../../../types/events/DiagramDragEvent";
import type { ImageProps } from "../../../types/props/shapes/ImageProps";

// Import components.
import { PositionLabel } from "../../core/PositionLabel";
import { Outline } from "../../core/Outline";
import { Transformative } from "../../core/Transformative";
import { ImageElement } from "./ImageStyled";

// Import hooks.
import { useDrag } from "../../../hooks/useDrag";
import { useClick } from "../../../hooks/useClick";
import { useSelect } from "../../../hooks/useSelect";

// Import utils.
import { degreesToRadians } from "../../../utils/math/common/degreesToRadians";
import { createSvgTransform } from "../../../utils/shapes/common/createSvgTransform";
import { mergeProps } from "../../../utils/common/mergeProps";

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
	base64Data,
	showOutline = false,
	showTransformControls = false,
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

	// Prepare props for the drag element.
	const dragProps = useDrag({
		id,
		type: "Rectangle",
		x,
		y,
		ref: svgRef,
		onDrag: handleDrag,
	});
	// Generate properties for clicking
	const clickProps = useClick({
		id,
		x,
		y,
		ref: svgRef,
		onClick,
	});
	// Generate properties for selection
	const selectProps = useSelect({
		id,
		isSelected,
		ref: svgRef,
		onSelect,
	});
	// Compose props for ImageElement
	const composedProps = mergeProps(dragProps, clickProps, selectProps);

	// Create the transform attribute for the element.
	const transform = createSvgTransform(
		scaleX,
		scaleY,
		degreesToRadians(rotation),
		x,
		y,
	);

	// Flag to show the transformative element.
	const showTransformative = showTransformControls && !isDragging;

	return (
		<>
			<g transform={transform}>
				<ImageElement
					id={id}
					x={-width / 2}
					y={-height / 2}
					width={width}
					height={height}
					tabIndex={0}
					cursor="move"
					href={`data:image/png;base64,${base64Data}`}
					isTransparent={false}
					ref={svgRef}
					{...composedProps}
				/>
			</g>
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
					showTransformControls={showTransformControls}
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
