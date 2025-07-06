// Import React.
import type React from "react";
import { memo, useCallback, useMemo, useRef, useState } from "react";

// Import types.
import type { DiagramHoverChangeEvent } from "../../../types/events/DiagramHoverChangeEvent";
import type { DiagramDragDropEvent } from "../../../types/events/DiagramDragDropEvent";
import type { RectangleProps } from "../../../types/props/shapes/RectangleProps";

// Import components.
import { Outline } from "../../core/Outline";
import { PositionLabel } from "../../core/PositionLabel";
import { Textable } from "../../core/Textable";
import { Transformative } from "../../core/Transformative";
import { ConnectPoint } from "../ConnectPoint";

// Import hooks.
import { useClick } from "../../../hooks/useClick";
import { useDrag } from "../../../hooks/useDrag";
import { useFileDrop } from "../../../hooks/useFileDrop";
import { useHover } from "../../../hooks/useHover";
import { useSelect } from "../../../hooks/useSelect";
import { useText } from "../../../hooks/useText";

// Import utils.
import { mergeProps } from "../../../utils/common/mergeProps";
import { degreesToRadians } from "../../../utils/math/common/degreesToRadians";
import { createSvgTransform } from "../../../utils/shapes/common/createSvgTransform";

// Import local module files.
import { RectangleElement } from "./RectangleStyled";

/**
 * Rectangle component
 */
const RectangleComponent: React.FC<RectangleProps> = ({
	id,
	x,
	y,
	width,
	height,
	radius,
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
	showConnectPoints = true,
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
	onDragEnter,
	onDragLeave,
	onClick,
	onSelect,
	onTransform,
	onConnect,
	onTextChange,
	onFileDrop,
	onHoverChange,
}) => {
	// Flag whether hovering
	const [isHovered, setIsHovered] = useState(false);
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

	/**
	 * Hover state change event handler
	 */
	const handleHover = useCallback(
		(e: DiagramHoverChangeEvent) => {
			setIsHovered(e.isHovered);
			// Propagate hover change event to canvas
			if (onHoverChange) {
				onHoverChange(e);
			}
		},
		[onHoverChange],
	);

	/**
	 * Drag over event handler
	 */
	const handleDragOver = useCallback(
		(e: DiagramDragDropEvent) => {
			setIsHovered(true);
			// Propagate drag enter event to canvas
			if (onDragEnter) {
				onDragEnter(e);
			}
		},
		[onDragEnter],
	);

	/**
	 * Drag leave event handler
	 */
	const handleDragLeave = useCallback(
		(e: DiagramDragDropEvent) => {
			setIsHovered(false);
			// Propagate drag leave event to canvas
			if (onDragLeave) {
				onDragLeave(e);
			}
		},
		[onDragLeave],
	);

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
		onDragOver: handleDragOver,
		onDragLeave: handleDragLeave,
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
		onHoverChange: handleHover,
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

	// Suppress ConnectPoint re-rendering by memoization
	// If separated by key and passed as individual props, each ConnectPoint side
	// performs comparison processing for each key which is inefficient, so detect Shape differences collectively here
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
	// Flag whether to show connect points
	const doShowConnectPoints =
		showConnectPoints && !isSelected && !isDragging && !isTransforming;

	return (
		<>
			<g transform="translate(0.5,0.5)">
				<RectangleElement
					id={id}
					x={-width / 2}
					y={-height / 2}
					width={width}
					height={height}
					rx={radius}
					ry={radius}
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
			</g>
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
					isTransforming={isTransforming}
					onTransform={onTransform}
				/>
			)}
			{doShowConnectPoints &&
				connectPoints.map((cp) => (
					<ConnectPoint
						key={cp.id}
						id={cp.id}
						name={cp.name}
						x={cp.x}
						y={cp.y}
						ownerId={id}
						ownerShape={ownerShape}
						isTransparent={!isHovered || isDragging || isTransforming}
						onConnect={onConnect}
					/>
				))}
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

export const Rectangle = memo(RectangleComponent);
