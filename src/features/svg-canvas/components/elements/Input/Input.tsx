// Import React.
import type React from "react";
import { memo, useMemo, useRef } from "react";

// Import types.
import type { InputProps } from "../../../types/props/elements/InputProps";

// Import constants.
import { InputDefaultData } from "../../../constants/data/elements/InputDefaultData";

// Import components.
import { Outline } from "../../core/Outline";
import { Textable } from "../../core/Textable";
import { Transformative } from "../../core/Transformative";
import { ConnectPoints } from "../../shapes/ConnectPoints";

// Import hooks.
import { useClick } from "../../../hooks/useClick";
import { useDrag } from "../../../hooks/useDrag";
import { useHover } from "../../../hooks/useHover";
import { useSelect } from "../../../hooks/useSelect";
import { useText } from "../../../hooks/useText";

// Import utils.
import { mergeProps } from "../../../utils/core/mergeProps";
import { degreesToRadians } from "../../../utils/math/common/degreesToRadians";
import { createSvgTransform } from "../../../utils/shapes/common/createSvgTransform";

/**
 * Input component - a simple text shape with textable feature only
 */
const InputComponent: React.FC<InputProps> = ({
	id,
	x,
	y,
	width,
	height,
	scaleX,
	scaleY,
	rotation,
	keepProportion,
	fill = InputDefaultData.fill,
	stroke = InputDefaultData.stroke,
	strokeWidth = InputDefaultData.strokeWidth,
	cornerRadius = InputDefaultData.cornerRadius,
	text,
	textType,
	fontColor = InputDefaultData.fontColor,
	fontSize = InputDefaultData.fontSize,
	fontFamily = InputDefaultData.fontFamily,
	fontWeight = InputDefaultData.fontWeight,
	textAlign = InputDefaultData.textAlign,
	verticalAlign = InputDefaultData.verticalAlign,
	isTextEditing,
	isTextEditEnabled = true,
	isSelected,
	isAncestorSelected = false,
	isDragging = false,
	connectPoints = [],
	showConnectPoints = false,
	connectEnabled = true,
	showOutline = false,
	showTransformControls = false,
	isTransforming = false,
	onDrag,
	onDragOver,
	onDragLeave,
	onClick,
	onSelect,
	onTransform,
	onConnect,
	onPreviewConnectLine,
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

	// Generate properties for text editing with coordinate transformation
	const { onDoubleClick } = useText({
		id,
		isSelected,
		isTextEditEnabled,
		onTextChange,
		attributes: {
			x,
			y,
			width,
			height,
			scaleX,
			scaleY,
			rotation,
			text,
			textType,
			fontColor,
			fontSize,
			fontFamily,
			fontWeight,
			textAlign,
			verticalAlign,
		},
	});

	// Generate properties for dragging
	const dragProps = useDrag({
		id,
		type: "Input",
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

	// Suppress ConnectPoint re-rendering by memoization
	// If separated by key and passed as individual props, each ConnectPoint side
	// performs comparison processing for each key which is inefficient, so detect Shape differences collectively here
	const ownerFrame = useMemo(
		() => ({
			x,
			y,
			width,
			height,
			rotation,
			scaleX,
			scaleY,
		}),
		[x, y, width, height, rotation, scaleX, scaleY],
	);

	// Generate rect transform attribute
	const transform = createSvgTransform(
		scaleX,
		scaleY,
		degreesToRadians(rotation),
		x,
		y,
	);

	return (
		<>
			{/* Background rectangle for interaction and styling */}
			<rect
				id={id}
				x={-width / 2}
				y={-height / 2}
				width={width}
				height={height}
				rx={cornerRadius}
				ry={cornerRadius}
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
			{/* Text content */}
			{isTextEditEnabled && (
				<Textable
					x={-width / 2}
					y={-height / 2}
					width={width}
					height={height}
					transform={transform}
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
			{showTransformControls && (
				<Transformative
					id={id}
					type="Input"
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
			<ConnectPoints
				ownerId={id}
				ownerFrame={ownerFrame}
				connectPoints={connectPoints}
				showConnectPoints={showConnectPoints}
				shouldRender={!isDragging && !isTransforming && !isSelected}
				connectEnabled={connectEnabled}
				onConnect={onConnect}
				onPreviewConnectLine={onPreviewConnectLine}
			/>
		</>
	);
};

export const Input = memo(InputComponent);
