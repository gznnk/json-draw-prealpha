// Import React.
import type React from "react";
import { memo } from "react";

// Import types related to SvgCanvas.
import type { RectangleVertices } from "../../../../types/CoordinateTypes";

// Import functions related to SvgCanvas.
import { calcRectangleVertices } from "../../../../utils/Math";

// Imports related to this component.
import { DiagramMenuDiv, DiagramMenuDivider } from "./DiagramMenuStyled";
import type { DiagramMenuProps } from "./DiagramMenuTypes";
import { DiagramMenuItem } from "../DiagramMenuItem/DiagramMenuItem";

const DiagramMenuComponent: React.FC<DiagramMenuProps> = ({
	x,
	y,
	width,
	height,
	rotation,
	scaleX,
	scaleY,
	isVisible,
}) => {
	if (!isVisible) return null;

	const vertices = calcRectangleVertices({
		x,
		y,
		width,
		height,
		rotation,
		scaleX,
		scaleY,
	});

	const menuX = x - 100;
	const menuY =
		Object.keys(vertices).reduce((max, key) => {
			const vertex = vertices[key as keyof RectangleVertices];
			return Math.max(max, vertex.y);
		}, Number.NEGATIVE_INFINITY) + 20;

	return (
		<DiagramMenuDiv x={menuX} y={menuY}>
			<DiagramMenuItem>a</DiagramMenuItem>
			<DiagramMenuDivider />
			<DiagramMenuItem>b</DiagramMenuItem>
		</DiagramMenuDiv>
	);
};

export const DiagramMenu = memo(DiagramMenuComponent);
