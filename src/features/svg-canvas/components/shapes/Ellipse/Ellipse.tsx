// Import React.
import type React from "react";
import { memo, useCallback, useMemo, useRef, useState } from "react";

// Import types.
import type { DiagramHoverChangeEvent } from "../../../types/events/DiagramHoverChangeEvent";
import type { EllipseProps } from "../../../types/props/shapes/EllipseProps";

// SvgCanvas components.
import { Outline } from "../../core/Outline";
import { PositionLabel } from "../../core/PositionLabel";
import { Textable } from "../../core/Textable";
import { Transformative } from "../../core/Transformative";
import { ConnectPoint } from "../ConnectPoint";

// Import hooks.
import { useClick } from "../../../hooks/useClick";
import { useDrag } from "../../../hooks/useDrag";
import { useHover } from "../../../hooks/useHover";
import { useSelect } from "../../../hooks/useSelect";
import { useText } from "../../../hooks/useText";

// Import utils.
import { mergeProps } from "../../../utils/common/mergeProps";
import { degreesToRadians } from "../../../utils/math/common/degreesToRadians";
import { createSvgTransform } from "../../../utils/shapes/common/createSvgTransform";

// Import local module files.
import { EllipseElement } from "./EllipseStyled";

/**
 * Ellipse component
 */
const EllipseComponent: React.FC<EllipseProps> = ({
	id,
	x,
	y,
	width,
	height,
	rotation,
	scaleX,
	scaleY,
	fill,
	stroke,
	strokeWidth,
	keepProportion,
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
	onClick,
	onSelect,
	onTransform,
	onConnect,
	onTextChange,
}) => {
	// Flag whether hovering
	const [isHovered, setIsHovered] = useState(false);
	// Reference to the SVG element to be transformed
	const svgRef = useRef<SVGEllipseElement>({} as SVGEllipseElement);

	// To avoid frequent handler generation, hold referenced values in useRef
	const refBusVal = {
		// Properties
		id,
		isSelected,
		isTextEditEnabled,
		onDrag,
		onSelect,
		onTextChange,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	/**
	 * Hover state change event handler
	 */
	const handleHover = useCallback((e: DiagramHoverChangeEvent) => {
		setIsHovered(e.isHovered);
	}, []);

	/**
	 * Drag over event handler
	 */
	const handleDragOver = useCallback(() => {
		setIsHovered(true);
	}, []);

	/**
	 * Drag leave event handler
	 */
	const handleDragLeave = useCallback(() => {
		setIsHovered(false);
	}, []);

	// Generate properties for text editing
	const { onDoubleClick } = useText({
		id,
		isSelected,
		isTextEditEnabled,
		onTextChange,
	});
	// Generate drag properties
	const dragProps = useDrag({
		id,
		type: "Ellipse",
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
	// Compose props for EllipseElement
	const composedProps = mergeProps(
		dragProps,
		clickProps,
		selectProps,
		hoverProps,
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
	// Generate ellipse transform attribute
	const transform = createSvgTransform(
		scaleX,
		scaleY,
		degreesToRadians(rotation),
		x,
		y,
	);

	// Flag whether to show connect points
	const showConnectPointsFlag =
		showConnectPoints && !isSelected && !isDragging && !isTransforming;

	return (
		<>
			<g transform="translate(0.5,0.5)">
				<EllipseElement
					id={id}
					cx={0}
					cy={0}
					rx={width / 2}
					ry={height / 2}
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
					type="Ellipse"
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
			{showConnectPointsFlag &&
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

export const Ellipse = memo(EllipseComponent);
