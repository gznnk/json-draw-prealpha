// Import React.
import type React from "react";
import { memo } from "react";

// Import other libraries.
// import styled from "@emotion/styled";

// Import types related to SvgCanvas.
import type { RectangleVertices } from "../../../types/CoordinateTypes";

// Import functions related to SvgCanvas.
import { calcRectangleVertices } from "../../../utils/Math";

type DiagramMenuProps = {
	x: number;
	y: number;
	width: number;
	height: number;
	rotation: number;
	scaleX: number;
	scaleY: number;
	isVisible: boolean;
};

const DiagramMenu: React.FC<DiagramMenuProps> = ({
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

	const menuY =
		Object.keys(vertices).reduce((max, key) => {
			const vertex = vertices[key as keyof RectangleVertices];
			return Math.max(max, vertex.y);
		}, Number.NEGATIVE_INFINITY) + 20;

	return <div style={{ position: "absolute", top: menuY, left: x }}>aaa</div>;
};

export default memo(DiagramMenu);
