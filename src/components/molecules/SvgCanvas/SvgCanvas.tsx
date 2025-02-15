import styled from "@emotion/styled";
import type React from "react";

type ContainerDivProps = {
	width: string;
	height: string;
	children: React.ReactNode;
	title?: string;
};

const ContainerDiv = styled.div<ContainerDivProps>`
	width: ${({ width }) => width};
	height: ${({ height }) => height};
	position: absolute;
    top: 0;
    left: 0;
`;

type SvgCanvasProps = {
	width: string;
	height: string;
	children: React.ReactNode;
	title?: string;
};

const SvgCanvas: React.FC<SvgCanvasProps> = ({
	title,
	width,
	height,
	children,
}) => {
	return (
		<ContainerDiv width={width} height={height}>
			<svg width="100%" height="100%">
				<title>{title}</title>
				{children}
			</svg>
		</ContainerDiv>
	);
};

export default SvgCanvas;
