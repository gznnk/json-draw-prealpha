import styled from "@emotion/styled";
import type React from "react";
import type Point from "../../../types/Point";
import type { ChangeEvent, ItemSelectEvent } from "./types";
import Rectangle from "./components/molecules/Rectangle";
import { memo } from "react";

export type Item = {
	id: string;
	point: Point;
	width: number;
	height: number;
	isSelected?: boolean;
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
	onItemSelect?: (e: ItemSelectEvent) => void;
};

const SvgCanvas: React.FC<SvgCanvasProps> = memo(
	({ title, items, onChangeEnd, onItemSelect }) => {
		console.log("SvgCanvas render");

		const renderedItems = items.map((item) => (
			<Rectangle
				key={item.id}
				id={item.id}
				initialPoint={item.point}
				initialWidth={item.width}
				initialHeight={item.height}
				isSelected={item.isSelected}
				onChangeEnd={onChangeEnd}
				onPointerDown={onItemSelect}
			/>
		));

		return (
			<ContainerDiv>
				<svg
					width="120vw"
					height="120vh"
					onPointerDown={(e) => {
						if (e.target === e.currentTarget) {
							onItemSelect?.({});
						}
					}}
				>
					<title>{title}</title>
					{renderedItems}
				</svg>
			</ContainerDiv>
		);
	},
);

export default SvgCanvas;
