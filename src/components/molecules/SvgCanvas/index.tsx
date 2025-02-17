import styled from "@emotion/styled";
import type React from "react";
import type Point from "../../../types/Point";
import type { ChangeEvent } from "./types";
import Rectangle from "./components/molecules/Rectangle";

export type Item = {
	id: string;
	point: Point;
	width: number;
	height: number;
};

const ContainerDiv = styled.div`
	position: absolute;
    top: 0;
    left: 0;
	right: 0;
	bottom: 0;
	overflow: auto;
`;

type SvgCanvasProps = {
	title?: string;
	items: Array<Item>;
	onChangeEnd?: (e: ChangeEvent) => void;
};

const SvgCanvas: React.FC<SvgCanvasProps> = ({ title, items, onChangeEnd }) => {
	const renderedItems = items.map((item) => (
		<Rectangle
			key={item.id}
			id={item.id}
			initialPoint={item.point}
			initialWidth={item.width}
			initialHeight={item.height}
			onChangeEnd={onChangeEnd}
		/>
	));

	return (
		<ContainerDiv>
			<svg width="120vw" height="120vh">
				<title>{title}</title>
				{renderedItems}
			</svg>
		</ContainerDiv>
	);
};

export default SvgCanvas;
