// Import React.
import type React from "react";
import { memo, useCallback, useRef, useState, useMemo } from "react";

// Import other libraries.
import DOMPurify from "dompurify";

// Import types related to SvgCanvas.
import type {
	DiagramDragEvent,
	DiagramPointerEvent,
} from "../../../types/EventTypes";

// Import components related to SvgCanvas.
import { PositionLabel } from "../../core/PositionLabel";
import { Transformative } from "../../core/Transformative";

// Import hooks related to SvgCanvas.
import { useDrag } from "../../../hooks/useDrag";

// Import functions related to SvgCanvas.
import { createSvgTransform } from "../../../utils/Diagram";
import { degreesToRadians } from "../../../utils/Math";

// Imports related to this component.
import type { SvgProps } from "./SvgTypes";

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
	isMultiSelectSource,
	syncWithSameId = false,
	initialWidth,
	initialHeight,
	svgText,
	onDrag,
	onClick,
	onSelect,
	onTransform,
}) => {
	// Is the element being dragged.
	const [isDragging, setIsDragging] = useState(false);
	// Reference to the element.
	const svgRef = useRef<SVGRectElement>({} as SVGRectElement);

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

	// Cache the inner text of the SVG element.
	// This is done to avoid parsing the SVG text on every render.
	const innerText = useMemo(() => {
		const parser = new DOMParser();
		const sanitizedSvgText = DOMPurify.sanitize(svgText, {
			NAMESPACE: "http://www.w3.org/2000/svg",
		});
		const svgDoc = parser.parseFromString(sanitizedSvgText, "image/svg+xml");
		const svgElement = svgDoc.documentElement;
		const width = Number.parseFloat(svgElement.getAttribute("width") || "0");
		const height = Number.parseFloat(svgElement.getAttribute("height") || "0");
		// Convert child element percentage values to pixels.
		for (const child of svgElement.children) {
			if (child instanceof SVGElement) {
				const widthAttr = child.getAttribute("width");
				const heightAttr = child.getAttribute("height");
				if (widthAttr?.endsWith("%")) {
					const percentage = Number.parseFloat(widthAttr) / 100;
					child.setAttribute("width", `${percentage * width}px`);
				}
				if (heightAttr?.endsWith("%")) {
					const percentage = Number.parseFloat(heightAttr) / 100;
					child.setAttribute("height", `${percentage * height}px`);
				}
			}
		}

		return svgElement.innerHTML;
	}, [svgText]);

	// Flag to show the transformative element.
	const showTransformative = isSelected && !isMultiSelectSource && !isDragging;

	return (
		<>
			<g transform={transform}>
				<g
					className="diagram"
					// biome-ignore lint/security/noDangerouslySetInnerHtml: This is the only way to set SVG content.
					dangerouslySetInnerHTML={{
						__html: innerText,
					}}
					transform={`translate(${-width / 2}, ${-height / 2}) scale(${(scaleX * width) / initialWidth}, ${(scaleY * height) / initialHeight})`}
				/>
				{/* Element for handle pointer events */}
				<rect
					className="diagram"
					id={id}
					x={-width / 2}
					y={-height / 2}
					width={width}
					height={height}
					tabIndex={0}
					cursor="move"
					fill="transparent"
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

export const Svg = memo(SvgComponent);
