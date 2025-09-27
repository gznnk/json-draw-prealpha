import type React from "react";
import { memo, useMemo } from "react";

import type { BaseShapeProps } from "../../../types/props/shapes/BaseShapeProps";
import { Outline } from "../../core/Outline";
import { PositionLabel } from "../../core/PositionLabel";
import { Textable } from "../../core/Textable";
import { Transformative } from "../../core/Transformative";
import { ConnectPoints } from "../ConnectPoints";

/**
 * BaseShape component that wraps common interactive functionality
 * Provides Textable, Outline, Transformative, ConnectPoints, and PositionLabel
 */
const BaseShapeComponent: React.FC<BaseShapeProps> = ({
	id,
	type,
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
	isSelected,
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
	showOutline = false,
	showTransformControls = false,
	isTransforming = false,
	transform,
	onTransform,
	onConnect,
	onPreviewConnectLine,
	children,
}: BaseShapeProps) => {
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

	return (
		<>
			{children}
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
					type={type}
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
			{connectPoints && (
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
			)}
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

export const BaseShape = memo(BaseShapeComponent);
