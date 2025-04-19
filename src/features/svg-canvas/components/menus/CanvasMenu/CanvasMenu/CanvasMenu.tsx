// Import React.
import type React from "react";
import { memo } from "react";

// Import types related to SvgCanvas.
import type { NewDiagramEvent } from "../../../../types/EventTypes";

// Imports related to this component.
import { CanvasMenuDiv } from "./CanvasMenuStyled";
import { CanvasMenuItem } from "../CanvasMenuItem";

type CanvasMenuProps = {
	onNewDiagram?: (e: NewDiagramEvent) => void;
};

const CanvasMenuComponent: React.FC<CanvasMenuProps> = ({ onNewDiagram }) => {
	return (
		<CanvasMenuDiv>
			<CanvasMenuItem
				onClick={() =>
					onNewDiagram?.({
						diagramType: "Rectangle",
					})
				}
			>
				<svg width="20" height="20" viewBox="0 0 24 24">
					<title>四角形を追加</title>
					<rect x="2" y="2" width="20" height="20" fill="none" stroke="black" />
				</svg>
			</CanvasMenuItem>
			<CanvasMenuItem
				onClick={() =>
					onNewDiagram?.({
						diagramType: "Ellipse",
					})
				}
			>
				<svg width="20" height="20" viewBox="0 0 24 24">
					<title>円を追加</title>
					<ellipse cx="12" cy="12" rx="10" ry="10" fill="none" stroke="black" />
				</svg>
			</CanvasMenuItem>
			<CanvasMenuItem
				onClick={() =>
					onNewDiagram?.({
						diagramType: "Path",
					})
				}
			>
				<svg width="20" height="20" viewBox="0 0 24 24">
					<title>線を追加</title>
					<path
						d="M22 22 L2 2 Z"
						fill="none"
						stroke="black"
						strokeWidth="1px"
					/>
				</svg>
			</CanvasMenuItem>
			<CanvasMenuItem
				onClick={() =>
					onNewDiagram?.({
						diagramType: "TextAreaNode",
					})
				}
			>
				あ
			</CanvasMenuItem>
		</CanvasMenuDiv>
	);
};

export const CanvasMenu = memo(CanvasMenuComponent);
