// Import React.
import type React from "react";
import { memo, useCallback, useEffect, useRef, useState } from "react";

// Import other libraries.
import DOMPurify from "dompurify";

// Import types.
import type { DiagramDragEvent } from "../../../types/events/DiagramDragEvent";
import type { SvgProps } from "../../../types/props/shapes/SvgProps";

// Import components.
import { PositionLabel } from "../../core/PositionLabel";
import { Outline } from "../../core/Outline";
import { Transformative } from "../../core/Transformative";
import { SvgGroupElement, SvgRectElement } from "./SvgStyled";

// Import hooks.
import { useDrag } from "../../../hooks/useDrag";
import { useClick } from "../../../hooks/useClick";
import { useSelect } from "../../../hooks/useSelect";

// Import utils.
import { createSvgTransform } from "../../../utils/shapes/common/createSvgTransform";
import { degreesToRadians } from "../../../utils/math/common/degreesToRadians";
import { mergeProps } from "../../../utils/common/mergeProps";

/**
 * Svg component.
 */
const SvgComponent: React.FC<SvgProps> = ({
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
	isAncestorSelected = false,
	initialWidth,
	initialHeight,
	svgText,
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
	const svgRef = useRef<SVGRectElement>({} as SVGRectElement);
	const groupRef = useRef<SVGGElement>({} as SVGGElement);

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
		isAncestorSelected,
		ref: svgRef,
		onClick,
	});
	// Generate properties for selection
	const selectProps = useSelect({
		id,
		onSelect,
	});
	// Compose props for SvgRectElement
	const composedProps = mergeProps(dragProps, clickProps, selectProps);

	// Create the transform attribute for the element.
	const transform = createSvgTransform(
		scaleX,
		scaleY,
		degreesToRadians(rotation),
		x,
		y,
	);

	// Cache the inner text of the SVG element.
	// This is done to avoid parsing the SVG text on every render.
	useEffect(() => {
		const parser = new DOMParser();
		const sanitizedSvgText = DOMPurify.sanitize(svgText, {
			NAMESPACE: "http://www.w3.org/2000/svg",
		});
		const svgDoc = parser.parseFromString(sanitizedSvgText, "image/svg+xml");
		const svgElement = svgDoc.documentElement;
		svgElement.setAttribute("width", `${initialWidth}`);
		svgElement.setAttribute("height", `${initialHeight}`);

		groupRef.current.innerHTML = ""; // Clear the previous content
		groupRef.current.appendChild(svgElement); // Append the new SVG element
	}, [svgText, initialWidth, initialHeight]);

	// Flag to show the transformative element.
	const showTransformative = showTransformControls && !isDragging;

	return (
		<>
			<g transform={transform}>
				<SvgGroupElement
					transform={`translate(${-width / 2}, ${-height / 2}) scale(${width / initialWidth}, ${height / initialHeight})`}
					isTransparent={false}
					ref={groupRef}
				/>
				{/* Element for handle pointer events */}
				<SvgRectElement
					id={id}
					x={-width / 2}
					y={-height / 2}
					width={width}
					height={height}
					tabIndex={0}
					cursor="move"
					fill="transparent"
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

export const Svg = memo(SvgComponent);
