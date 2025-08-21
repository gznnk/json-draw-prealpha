// Import React.
import type React from "react";
import { memo, useMemo, useRef } from "react";

// Import types.
import type { ButtonProps } from "../../../types/props/diagrams/ButtonProps";

// Import components.
import { Outline } from "../../core/Outline";
import { PositionLabel } from "../../core/PositionLabel";
import { Textable } from "../../core/Textable";
import { Transformative } from "../../core/Transformative";
import { ConnectPoints } from "../../shapes/ConnectPoints";

// Import hooks.
import { useClick } from "../../../hooks/useClick";
import { useDrag } from "../../../hooks/useDrag";
import { useFileDrop } from "../../../hooks/useFileDrop";
import { useHover } from "../../../hooks/useHover";
import { useSelect } from "../../../hooks/useSelect";
import { useText } from "../../../hooks/useText";

// Import utils.
import { mergeProps } from "../../../utils/core/mergeProps";
import { degreesToRadians } from "../../../utils/math/common/degreesToRadians";
import { createSvgTransform } from "../../../utils/shapes/common/createSvgTransform";

// Import styled components.
import { ButtonElement } from "./ButtonStyled";

/**
 * Button component
 */
const ButtonComponent: React.FC<ButtonProps> = ({
	id,
	x,
	y,
	width,
	height,
	borderRadius,
	rotation,
	scaleX,
	scaleY,
	keepProportion,
	fill,
	stroke,
	strokeWidth,
	isSelected,
	isAncestorSelected = false,
	connectPoints,
	showConnectPoints = false,
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
	isTransparent,
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
	onFileDrop,
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
		// TODO: 例として書いてるだけで不要なので消す
		attributes: {
			x,
			y,
			width,
			height,
			rotation,
			scaleX,
			scaleY,
			text,
			textType,
			fontColor,
			fontSize,
			fontFamily,
			fontWeight,
			textAlign,
			verticalAlign,
		},
		isSelected,
		isTextEditEnabled,
		onTextChange,
	});

	// Generate properties for dragging
	const dragProps = useDrag({
		id,
		type: "Button",
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

	// Generate properties for file drop
	const fileDropProps = useFileDrop({ id, onFileDrop });

	// Compose props for ButtonElement
	const composedProps = mergeProps(
		dragProps,
		clickProps,
		selectProps,
		hoverProps,
		fileDropProps,
	);

	// Suppress ConnectPoint re-rendering by memoization
	const ownerShape = useMemo(
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
			<ButtonElement
				id={id}
				x={-width / 2}
				y={-height / 2}
				width={width}
				height={height}
				rx={borderRadius}
				ry={borderRadius}
				fill={fill}
				stroke={stroke}
				strokeWidth={strokeWidth}
				tabIndex={0}
				cursor="move"
				isTransparent={isTransparent}
				transform={transform}
				ref={svgRef}
				onDoubleClick={onDoubleClick}
				{...composedProps}
			/>
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
					type="Button"
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
				ownerShape={ownerShape}
				connectPoints={connectPoints}
				showConnectPoints={showConnectPoints}
				shouldRender={!isDragging && !isTransforming && !isSelected}
				onConnect={onConnect}
				onPreviewConnectLine={onPreviewConnectLine}
			/>
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

export const Button = memo(ButtonComponent);
