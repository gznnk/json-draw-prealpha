import type React from "react";
import type Point from "../../types/Point";
import styled from "@emotion/styled";

type RectangleDivProps = {
	color?: string;
	border?: string;
};

const RectangleDiv = styled.div<RectangleDivProps>`
    position: absolute;
    background-color: ${({ color }) => color};
    border: ${({ border }) => border};
    box-sizing: border-box;
`;

type RectangleProps = {
	children?: React.ReactNode;
	start: Point;
	end: Point;
	color?: string;
	border?: string;
};

const Rectangle: React.FC<RectangleProps> = ({
	children,
	start,
	end,
	color,
	border = "1px solid black",
}) => {
	const left = Math.min(start.x, end.x);
	const top = Math.min(start.y, end.y);

	const width = Math.abs(start.x - end.x);
	const height = Math.abs(start.y - end.y);

	return (
		<RectangleDiv
			color={color}
			border={border}
			style={{ top, left, width, height }}
		>
			{children}
		</RectangleDiv>
	);
};

export default Rectangle;
