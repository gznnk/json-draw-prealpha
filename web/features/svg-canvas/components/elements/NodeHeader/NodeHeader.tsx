import React, { memo } from "react";

import { ICON_TEXT_MARGIN } from "./NodeHeaderConstants";
import { MainContainerGroup } from "./NodeHeaderStyled";
import { NodeHeaderDefaultData } from "../../../constants/data/elements/NodeHeaderDefaultData";
import type { NodeHeaderProps } from "../../../types/props/elements/NodeHeaderProps";
import { degreesToRadians } from "../../../utils/math/common/degreesToRadians";
import { efficientAffineTransformation } from "../../../utils/math/transform/efficientAffineTransformation";
import { createSvgTransform } from "../../../utils/shapes/common/createSvgTransform";
import { Input } from "../Input";

/**
 * NodeHeader component - an icon with text in a row layout
 */
const NodeHeaderComponent: React.FC<NodeHeaderProps> = ({
	id,
	x,
	y,
	width,
	height = NodeHeaderDefaultData.height,
	scaleX,
	scaleY,
	rotation,
	text,
	fontColor = NodeHeaderDefaultData.fontColor,
	fontSize = NodeHeaderDefaultData.fontSize,
	fontFamily = NodeHeaderDefaultData.fontFamily,
	fontWeight = NodeHeaderDefaultData.fontWeight,
	textAlign = NodeHeaderDefaultData.textAlign,
	verticalAlign = NodeHeaderDefaultData.verticalAlign,
	isTextEditing,
	icon,
	iconBackgroundColor = NodeHeaderDefaultData.iconBackgroundColor,
	isSelected,
	isAncestorSelected = false,
	onDrag,
	onSelect,
	onClick,
	onHoverChange,
	onTextChange,
}) => {
	// Constants for layout
	const ICON_SCALE = 0.8;
	const iconSize = height;
	const iconCenterX = -width / 2 + iconSize / 2;
	const textWidth = width - iconSize - ICON_TEXT_MARGIN; // Remaining width minus margin ; // Margin from icon
	const textCenter = efficientAffineTransformation(
		textWidth / 2 - (width / 2 - iconSize - ICON_TEXT_MARGIN),
		0,
		scaleX,
		scaleY,
		degreesToRadians(rotation),
		x,
		y,
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
			<MainContainerGroup transform={transform}>
				{/* Icon background (rounded rectangle) */}
				<rect
					x={iconCenterX - iconSize / 2}
					y={-iconSize / 2}
					width={iconSize}
					height={iconSize}
					rx={iconSize * 0.2}
					ry={iconSize * 0.2}
					fill={iconBackgroundColor}
				/>

				{/* Icon component */}
				{icon && (
					<g
						transform={`translate(${iconCenterX - (iconSize * ICON_SCALE) / 2}, ${-(iconSize * ICON_SCALE) / 2})`}
					>
						{React.createElement(icon, {
							width: iconSize * ICON_SCALE,
							height: iconSize * ICON_SCALE,
							fill: "#ffffff",
						})}
					</g>
				)}
			</MainContainerGroup>

			{/* Text content */}
			<Input
				id={id}
				x={textCenter.x}
				y={textCenter.y}
				width={textWidth}
				height={height}
				scaleX={scaleX}
				scaleY={scaleY}
				rotation={rotation}
				keepProportion={false}
				strokeWidth="0px"
				text={text}
				textType="text"
				fontColor={fontColor}
				fontSize={fontSize}
				fontFamily={fontFamily}
				fontWeight={fontWeight}
				textAlign={textAlign}
				verticalAlign={verticalAlign}
				isTextEditing={isTextEditing}
				isSelected={isSelected}
				isAncestorSelected={isAncestorSelected}
				showConnectPoints={false}
				connectEnabled={false}
				showOutline={false}
				isTransforming={false}
				showTransformControls={false}
				onDrag={onDrag}
				onSelect={onSelect}
				onClick={onClick}
				onHoverChange={onHoverChange}
				onTextChange={onTextChange}
			/>
		</>
	);
};

export const NodeHeader = memo(NodeHeaderComponent);
