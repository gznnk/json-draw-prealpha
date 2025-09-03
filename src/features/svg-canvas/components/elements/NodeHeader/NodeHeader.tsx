// Import React.
import type React from "react";
import { memo, useRef } from "react";

// Import types.
import type { NodeHeaderProps } from "../../../types/props/elements/NodeHeaderProps";

// Import constants.
import { NodeHeaderDefaultData } from "../../../constants/data/elements/NodeHeaderDefaultData";

// Import components.
import { Textable } from "../../core/Textable";

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

// Import local modules.
import { ICON_TEXT_MARGIN } from "./NodeHeaderConstants";

/**
 * NodeHeader component - an icon with text in a row layout
 */
const NodeHeaderComponent: React.FC<NodeHeaderProps> = ({
	id,
	x,
	y,
	width,
	height = 30,
	scaleX,
	scaleY,
	rotation,
	text,
	textType,
	fontColor = NodeHeaderDefaultData.fontColor,
	fontSize = NodeHeaderDefaultData.fontSize,
	fontFamily = NodeHeaderDefaultData.fontFamily,
	fontWeight = NodeHeaderDefaultData.fontWeight,
	textAlign = NodeHeaderDefaultData.textAlign,
	verticalAlign = NodeHeaderDefaultData.verticalAlign,
	iconComponent: IconComponent,
	iconBackgroundColor = NodeHeaderDefaultData.iconBackgroundColor,
	isTextEditing,
	isTextEditEnabled = true,
	isSelected,
	isAncestorSelected = false,
	onDrag,
	onDragOver,
	onDragLeave,
	onClick,
	onSelect,
	onTextChange,
	onHoverChange,
}) => {
	// Reference to the SVG element to be transformed
	const svgRef = useRef<SVGGElement>({} as SVGGElement);

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

	// Constants for layout
	const iconSize = height;
	const iconX = -width / 2 + iconSize / 2; // No left padding
	const textX = -width / 2 + iconSize + ICON_TEXT_MARGIN; // Margin from icon
	const textWidth = width - iconSize - ICON_TEXT_MARGIN; // Remaining width minus margin

	// Generate properties for text editing with coordinate transformation
	const { onDoubleClick } = useText({
		id,
		isSelected,
		isTextEditEnabled,
		onTextChange,
		attributes: {
			x: x + textX + textWidth / 2,
			y,
			width: textWidth,
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
		type: "NodeHeader",
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

	return (
		<>
			{/* Main container group */}
			<g
				id={id}
				tabIndex={0}
				cursor="move"
				transform={transform}
				ref={svgRef}
				onDoubleClick={onDoubleClick}
				{...composedProps}
			>
				{/* Icon background (rounded rectangle) */}
				<rect
					x={iconX - iconSize / 2}
					y={-iconSize / 2}
					width={iconSize}
					height={iconSize}
					rx={iconSize * 0.2}
					ry={iconSize * 0.2}
					fill={iconBackgroundColor}
				/>

				{/* Icon component */}
				{IconComponent && (
					<foreignObject
						x={iconX - iconSize / 2}
						y={-iconSize / 2}
						width={iconSize}
						height={iconSize}
					>
						<div
							style={{
								width: "100%",
								height: "100%",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
							}}
						>
							<IconComponent width={iconSize * 0.6} height={iconSize * 0.6} />
						</div>
					</foreignObject>
				)}
			</g>

			{/* Text content */}
			{isTextEditEnabled && (
				<Textable
					x={textX}
					y={-height / 2}
					width={textWidth}
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
		</>
	);
};

export const NodeHeader = memo(NodeHeaderComponent);
