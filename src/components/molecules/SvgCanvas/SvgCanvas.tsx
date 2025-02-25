// Reactのインポート
import React, { memo, useCallback } from "react";

// ライブラリのインポート
import styled from "@emotion/styled";

// SvgCanvas関連型定義をインポート
import type { Diagram } from "./types/DiagramTypes";
import { DiagramTypeComponentMap } from "./types/DiagramTypes";
import type {
	DiagramDragEvent,
	DiagramResizeEvent,
	ItemSelectEvent,
} from "./types/EventTypes";

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
	onDiagramDragEnd?: (e: DiagramDragEvent) => void;
	onDiagramDragEndByGroup?: (e: DiagramDragEvent) => void;
	onDiagramResizeEnd?: (e: DiagramResizeEvent) => void;
	onItemSelect?: (e: ItemSelectEvent) => void;
};

const SvgCanvas: React.FC<SvgCanvasProps> = memo(
	({
		title,
		items,
		onDiagramDragEnd,
		onDiagramDragEndByGroup,
		onDiagramResizeEnd,
		onItemSelect,
	}) => {
		const createDiagram = (item: Diagram): React.ReactNode => {
			const itemType = DiagramTypeComponentMap[item.type];
			const props = {
				...item,
				key: item.id,
				onDiagramDragEnd,
				onDiagramDragEndByGroup,
				onDiagramResizeEnd,
				onDiagramSelect: onItemSelect,
			};

			return React.createElement(itemType, props);
		};

		const renderedItems = items.map((item) => {
			return createDiagram(item);
		});

		const handlePointerDown = useCallback(
			(e: React.PointerEvent<SVGSVGElement>) => {
				if (e.target === e.currentTarget) {
					onItemSelect?.({ id: "dummy" });
				}
			},
			[onItemSelect],
		);

		const handleKeyDown = useCallback(
			(e: React.KeyboardEvent<SVGSVGElement>) => {
				// キャンバスにフォーカスがない場合はイベントをキャンセルし、スクロールを無効化
				if (e.target !== e.currentTarget) {
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
