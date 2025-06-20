// Import React.
import type React from "react";
import { memo, useCallback, useMemo, useRef, useState } from "react";

// Import types.
import type { DiagramDragEvent } from "../../../types/events/DiagramDragEvent";
import type { DiagramHoverChangeEvent } from "../../../types/events/DiagramHoverChangeEvent";
import type { DiagramPointerEvent } from "../../../types/events/DiagramPointerEvent";
import type { DiagramTransformEvent } from "../../../types/events/DiagramTransformEvent";
import type { EllipseProps } from "../../../types/props/shapes/EllipseProps";

// SvgCanvas related components import
import { PositionLabel } from "../../core/PositionLabel";
import { Outline } from "../../core/Outline";
import { Textable } from "../../core/Textable";
import { Transformative } from "../../core/Transformative";
import { ConnectPoint } from "../ConnectPoint";

// Import hooks.
import { useDrag } from "../../../hooks/useDrag";
import { useHover } from "../../../hooks/useHover";

// Import utils.
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
	isMultiSelectSource,
	connectPoints,
	showConnectPoints = true,
	syncWithSameId = false,
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
	isTransparent,
	showOutline = false,
	onDrag,
	onClick,
	onSelect,
	onTransform,
	onConnect,
	onTextEdit,
}) => {
	// Flag whether dragging
	const [isDragging, setIsDragging] = useState(false);
	// Flag whether transforming
	const [isTransformimg, setIsTransforming] = useState(false);
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
		onTransform,
		onTextEdit,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;
	/**
	 * Ellipse drag event handler
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
	 * Ellipse transform event handler
	 */
	const handleTransform = useCallback((e: DiagramTransformEvent) => {
		const { onTransform } = refBus.current;

		if (e.eventType === "Start") {
			setIsTransforming(true);
		}

		onTransform?.(e);

		if (e.eventType === "End") {
			setIsTransforming(false);
		}
	}, []);

	/**
	 * Pointer down event handler
	 */
	const handlePointerDown = useCallback((e: DiagramPointerEvent) => {
		const { id, onSelect } = refBus.current;
		// Fire shape selection event
		onSelect?.({
			eventId: e.eventId,
			id,
		});
	}, []);

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

	/**
	 * Double click event handler
	 */
	const handleDoubleClick = useCallback(() => {
		const { id, isSelected, isTextEditEnabled, onTextEdit } = refBus.current;

		if (!isTextEditEnabled) return;

		if (!isSelected) return;

		// Fire text editing event
		onTextEdit?.({
			id,
		});
	}, []);
	// Generate drag properties
	const dragProps = useDrag({
		id,
		type: "Ellipse",
		x,
		y,
		syncWithSameId,
		ref: svgRef,
		onPointerDown: handlePointerDown,
		onClick: onClick,
		onDrag: handleDrag,
		onDragOver: handleDragOver,
		onDragLeave: handleDragLeave,
	});
	// Generate properties for hovering
	const hoverProps = useHover({
		id,
		onHoverChange: handleHover,
	});
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

	// Flag whether to show transform component
	const showTransformative = isSelected && !isMultiSelectSource && !isDragging;

	// Flag whether to show connect points
	const doShowConnectPoints =
		showConnectPoints &&
		!isSelected &&
		!isMultiSelectSource &&
		!isDragging &&
		!isTransformimg;

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
					isTransparent={isTransparent || isMultiSelectSource}
					transform={transform}
					ref={svgRef}
					onDoubleClick={handleDoubleClick}
					{...dragProps}
					{...hoverProps}
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
				isSelected={isSelected}
				isMultiSelectSource={isMultiSelectSource}
				showOutline={showOutline}
			/>
			{showTransformative && (
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
					isSelected={isSelected}
					isMultiSelectSource={isMultiSelectSource}
					onTransform={handleTransform}
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
						isTransparent={!isHovered || isDragging || isTransformimg}
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
