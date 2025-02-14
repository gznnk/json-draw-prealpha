import type React from "react";
import type Point from "../../types/Point";
import styled from "@emotion/styled";

const LineDiv = styled.div`
    position: absolute;
`;

const Svg = styled.svg`
    position: absolute;
    top: 0;
    left: 0;
`;

type LineProps = {
	start: Point;
	end: Point;
	stroke?: string;
	strokeWidth?: number;
};

const Line: React.FC<LineProps> = ({
	start,
	end,
	stroke = "black",
	strokeWidth = 1,
}) => {
	const left = Math.min(start.x, end.x);
	const top = Math.min(start.y, end.y);
	const width = Math.max(strokeWidth, Math.abs(start.x - end.x));
	const height = Math.max(strokeWidth, Math.abs(start.y - end.y));

	return (
		<LineDiv style={{ left, top, width, height }}>
			<Svg width={width} height={height}>
				<line
					x1={start.x - left}
					y1={start.y - top}
					x2={end.x - left}
					y2={end.y - top}
					stroke={stroke}
					strokeWidth={strokeWidth}
				/>
			</Svg>
		</LineDiv>
	);
};

export default Line;
