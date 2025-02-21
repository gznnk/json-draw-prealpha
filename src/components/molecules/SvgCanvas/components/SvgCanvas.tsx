import styled from "@emotion/styled";
import React from "react";
import type {
	Diagram,
	DiagramType,
	ChangeEvent,
	ItemSelectEvent,
} from "./../types";
import Group from "./diagram/Group";
import Rectangle from "./diagram/Rectangle";
import Ellipse from "./diagram/Ellipse";
import { useCallback, memo } from "react";

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
	items: Array<Diagram>;
	onChangeEnd?: (e: ChangeEvent) => void;
	onItemSelect?: (e: ItemSelectEvent) => void;
};

type DiagramProps = Diagram & {
	onChangeEnd?: (e: ChangeEvent) => void;
	onPointerDown?: (e: ItemSelectEvent) => void;
	ref?: React.Ref<{
		draggableRef: React.RefObject<SVGElement>;
		onParentChange: (e: ChangeEvent) => void;
	}>;
};

// TODO: 場所
export const ITEM_TYPE_COMPONENT_MAP: {
	[key in DiagramType]: React.FC<DiagramProps>;
} = {
	group: Group,
	rectangle: Rectangle,
	ellipse: Ellipse,
};

const SvgCanvas: React.FC<SvgCanvasProps> = memo(
	({ title, items, onChangeEnd, onItemSelect }) => {
		// console.log("SvgCanvas render");

		const createDiagram = (item: Diagram): React.ReactNode => {
			const itemType = ITEM_TYPE_COMPONENT_MAP[item.type];
			const props = {
				...item,
				key: item.id,
				onChangeEnd,
				onPointerDown: onItemSelect,
			};

			return React.createElement(itemType, props);
		};

		const renderedItems = items.map((item) => {
			return createDiagram(item);
		});

		const handlePointerDown = useCallback(
			(e: React.PointerEvent<SVGSVGElement>) => {
				if (e.target === e.currentTarget) {
					onItemSelect?.({});
				}
			},
			[onItemSelect],
		);

		const handleKeyDown = useCallback(
			(e: React.KeyboardEvent<SVGSVGElement>) => {
				if (e.target !== e.currentTarget) {
					e.stopPropagation();
					e.preventDefault();
				}
			},
			[],
		);

		return (
			<ContainerDiv>
				<svg
					width="120vw"
					height="120vh"
					onPointerDown={handlePointerDown}
					onKeyDown={handleKeyDown}
				>
					<title>{title}</title>
					{renderedItems}
				</svg>
			</ContainerDiv>
		);
	},
);

export default SvgCanvas;
