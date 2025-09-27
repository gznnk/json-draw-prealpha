import type React from "react";
import { memo, useRef } from "react";

import { RectangleElement } from "./RectangleStyled";
import { useClick } from "../../../hooks/useClick";
import { useDrag } from "../../../hooks/useDrag";
import { useFileDrop } from "../../../hooks/useFileDrop";
import { useHover } from "../../../hooks/useHover";
import { useSelect } from "../../../hooks/useSelect";
import { useText } from "../../../hooks/useText";
import type { RectangleProps } from "../../../types/props/shapes/RectangleProps";
import { mergeProps } from "../../../utils/core/mergeProps";
import { degreesToRadians } from "../../../utils/math/common/degreesToRadians";
import { createSvgTransform } from "../../../utils/shapes/common/createSvgTransform";
import { BaseShape } from "../BaseShape";

/**
 * Rectangle component
 */
const RectangleComponent: React.FC<RectangleProps> = ({
	id,
	x,
	y,
	width,
	height,
	cornerRadius,
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
	connectEnabled = true,
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
		isSelected,
		isTextEditEnabled,
		onTextChange,
	});

	// Generate properties for dragging
	const dragProps = useDrag({
		id,
		type: "Rectangle",
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

	// Compose props for RectangleElement
	const composedProps = mergeProps(
		dragProps,
		clickProps,
		selectProps,
		hoverProps,
		fileDropProps,
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
		<BaseShape
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
			connectPoints={connectPoints}
			showConnectPoints={showConnectPoints}
			connectEnabled={connectEnabled}
			text={text}
			textType={textType}
			fontColor={fontColor}
			fontSize={fontSize}
			fontFamily={fontFamily}
			fontWeight={fontWeight}
			textAlign={textAlign}
			verticalAlign={verticalAlign}
			isTextEditing={isTextEditing}
			isTextEditEnabled={isTextEditEnabled}
			isDragging={isDragging}
			showOutline={showOutline}
			showTransformControls={showTransformControls}
			isTransforming={isTransforming}
			transform={transform}
			onTransform={onTransform}
			onConnect={onConnect}
			onPreviewConnectLine={onPreviewConnectLine}
		>
			<RectangleElement
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
				isTransparent={isTransparent}
				transform={transform}
				ref={svgRef}
				onDoubleClick={onDoubleClick}
				{...composedProps}
			/>
		</BaseShape>
	);
};

export const Rectangle = memo(RectangleComponent);
