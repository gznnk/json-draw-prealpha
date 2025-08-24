// Import React.
import type React from "react";
import { memo, useRef } from "react";

// Import types.
import type { TextProps } from "../../../types/props/elements/TextProps";

// Import components.
import { Outline } from "../../core/Outline";
import { PositionLabel } from "../../core/PositionLabel";
import { Textable } from "../../core/Textable";

// Import hooks.
import { useClick } from "../../../hooks/useClick";
import { useDrag } from "../../../hooks/useDrag";
import { useHover } from "../../../hooks/useHover";
import { useSelect } from "../../../hooks/useSelect";
import { useText } from "../../../hooks/useText";

// Import utils.
import { mergeProps } from "../../../utils/core/mergeProps";

/**
 * Text component - a simple text shape with textable feature only
 */
const TextComponent: React.FC<TextProps> = ({
	id,
	x,
	y,
	width,
	height,
	isSelected,
	isAncestorSelected = false,
	text,
	textType,
	fontColor,
	fontSize,
	fontFamily,
	fontWeight,
	textAlign,
	verticalAlign,
	isTextEditing,
	isTextEditEnabled = true,
	isDragging = false,
	showOutline = false,
	onDrag,
	onDragOver,
	onDragLeave,
	onClick,
	onSelect,
	onTextChange,
	onHoverChange,
}) => {
	// Reference to the SVG element to be transformed
	const svgRef = useRef<SVGRectElement>({} as SVGRectElement);

	// To avoid frequent handler generation, hold referenced values in useRef
	const refBusVal = {
		// Properties
		id,
		isSelected,
		isTextEditEnabled,
		onDrag,
		onTextChange,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	// Generate properties for text editing
	const { onDoubleClick } = useText({
		id,
		isSelected: isTextEditEnabled,
		isTextEditEnabled,
		onTextChange,
	});

	// Generate properties for dragging
	const dragProps = useDrag({
		id,
		type: "Text",
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

	return (
		<>
			{/* Invisible background rectangle for interaction */}
			<rect
				id={id}
				x={x - width / 2}
				y={y - height / 2}
				width={width}
				height={height}
				fill="transparent"
				stroke="none"
				tabIndex={0}
				cursor="move"
				ref={svgRef}
				onDoubleClick={onDoubleClick}
				{...composedProps}
			/>
			{/* Text content */}
			{isTextEditEnabled && (
				<Textable
					x={x - width / 2}
					y={y - height / 2}
					width={width}
					height={height}
					transform=""
					text={text}
					textType={textType}
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
				rotation={0}
				scaleX={1}
				scaleY={1}
				showOutline={showOutline}
			/>
			{/* Position label during drag */}
			{isSelected && isDragging && (
				<PositionLabel
					x={x}
					y={y}
					width={width}
					height={height}
					rotation={0}
					scaleX={1}
					scaleY={1}
				/>
			)}
		</>
	);
};

export const Text = memo(TextComponent);