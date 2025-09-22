import type React from "react";
import { memo, useRef } from "react";

import { STICKY_FOLD_SIZE } from "../../../constants/styling/diagrams/StickyStyleConstants";
import { useClick } from "../../../hooks/useClick";
import { useDrag } from "../../../hooks/useDrag";
import { useHover } from "../../../hooks/useHover";
import { useSelect } from "../../../hooks/useSelect";
import { useText } from "../../../hooks/useText";
import type { StickyProps } from "../../../types/props/diagrams/StickyProps";
import { mergeProps } from "../../../utils/core/mergeProps";
import { degreesToRadians } from "../../../utils/math/common/degreesToRadians";
import { createSvgTransform } from "../../../utils/shapes/common/createSvgTransform";
import { Outline } from "../../core/Outline";
import { PositionLabel } from "../../core/PositionLabel/PositionLabel";
import { Textable } from "../../core/Textable";
import { Transformative } from "../../core/Transformative";

/**
 * Sticky component - a sticky note diagram element
 */
const StickyComponent: React.FC<StickyProps> = ({
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
	fill,
	stroke,
	strokeWidth,
	text,
	fontColor,
	fontSize,
	fontFamily,
	fontWeight,
	textAlign,
	verticalAlign,
	isSelected,
	isAncestorSelected = false,
	isTextEditEnabled = true,
	isTextEditing = false,
	isDragging = false,
	showOutline = false,
	showTransformControls = false,
	isTransforming = false,
	onDrag,
	onDragOver,
	onDragLeave,
	onClick,
	onSelect,
	onTransform,
	onTextChange,
	onHoverChange,
}) => {
	// Reference to the SVG element to be transformed
	const svgRef = useRef<SVGPolygonElement>({} as SVGPolygonElement);

	// Handle text editing
	const { onDoubleClick } = useText({
		id,
		isSelected,
		isTextEditEnabled,
		onTextChange,
	});

	// Generate properties for dragging
	const dragProps = useDrag({
		id,
		type: "Sticky",
		x,
		y,
		ref: svgRef,
		onDrag,
		onDragOver,
		onDragLeave,
	});

	// Generate properties for clicking
	const clickProps = useClick({
		id,
		x,
		y,
		isSelected,
		isAncestorSelected,
		ref: svgRef,
		onClick,
	});

	// Generate properties for selection
	const selectProps = useSelect({
		id,
		onSelect,
	});

	// Generate properties for hovering
	const hoverProps = useHover({
		id,
		onHoverChange,
	});

	// Compose props for the SVG element
	const composedProps = mergeProps(
		dragProps,
		clickProps,
		selectProps,
		hoverProps,
	);

	// Generate transform attribute
	const transform = createSvgTransform(
		scaleX,
		scaleY,
		degreesToRadians(rotation),
		x,
		y,
	);

	// Create polygon points for sticky note with folded corner
	const foldSize = STICKY_FOLD_SIZE;
	const left = -width / 2;
	const right = width / 2;
	const top = -height / 2;
	const bottom = height / 2;

	const points = [
		[left, top], // Top-left
		[right, top], // Top-right
		[right, bottom - foldSize], // Right side until fold
		[right - foldSize, bottom], // Fold corner
		[left, bottom], // Bottom-left
	]
		.map(([px, py]) => `${px},${py}`)
		.join(" ");

	// Create fold triangle points for shadow effect
	const foldTrianglePoints = [
		[right - foldSize, bottom - foldSize], // Fold inner corner
		[right, bottom - foldSize], // Right side
		[right - foldSize, bottom], // Bottom side
	]
		.map(([px, py]) => `${px},${py}`)
		.join(" ");

	return (
		<>
			{/* Main sticky note with folded corner */}
			<polygon
				id={id}
				points={points}
				fill={fill}
				stroke={stroke}
				strokeWidth={strokeWidth}
				tabIndex={0}
				cursor="move"
				transform={transform}
				ref={svgRef}
				onDoubleClick={onDoubleClick}
				{...composedProps}
			/>

			{/* Folded corner shadow */}
			<polygon
				points={foldTrianglePoints}
				fill="rgba(0,0,0,0.1)"
				stroke="none"
				transform={transform}
				pointerEvents="none"
			/>

			{/* Text content */}
			{isTextEditEnabled && (
				<Textable
					x={-width / 2}
					y={-height / 2}
					width={width}
					height={height}
					transform={transform}
					text={text}
					textType="textarea"
					fontColor={fontColor}
					fontSize={fontSize}
					fontFamily={fontFamily}
					fontWeight={fontWeight}
					textAlign={textAlign}
					verticalAlign={verticalAlign}
					isTextEditing={isTextEditing}
				/>
			)}

			{/* Selection outline */}
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

			{/* Transform controls */}
			{showTransformControls && (
				<Transformative
					id={id}
					type="Sticky"
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

			{/* Position label during drag */}
			{isDragging && isSelected && (
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

export const Sticky = memo(StickyComponent);
