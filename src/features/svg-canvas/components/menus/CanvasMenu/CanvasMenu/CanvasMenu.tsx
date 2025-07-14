// Import React.
import type React from "react";
import { memo } from "react";

// Import types related to SvgCanvas.
import type { NewDiagramEvent } from "../../../../types/events/NewDiagramEvent";

// Import functions related to SvgCanvas.
import { newEventId } from "../../../../utils/common/newEventId";

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
						eventId: newEventId(),
						diagramType: "Rectangle",
						isSelected: true,
					})
				}
			>
				<svg width="20" height="20" viewBox="0 0 24 24">
					<title>Add Rectangle</title>
					<rect
						x="2"
						y="2"
						width="20"
						height="20"
						fill="none"
						stroke="#D0D4E0"
					/>
				</svg>
			</CanvasMenuItem>
			<CanvasMenuItem
				onClick={() =>
					onNewDiagram?.({
						eventId: newEventId(),
						diagramType: "Ellipse",
						isSelected: true,
					})
				}
			>
				<svg width="20" height="20" viewBox="0 0 24 24">
					<title>Add Circle</title>
					<ellipse
						cx="12"
						cy="12"
						rx="10"
						ry="10"
						fill="none"
						stroke="#D0D4E0"
					/>
				</svg>
			</CanvasMenuItem>
			<CanvasMenuItem
				onClick={() =>
					onNewDiagram?.({
						eventId: newEventId(),
						diagramType: "Path",
						isSelected: true,
					})
				}
			>
				<svg width="20" height="20" viewBox="0 0 24 24">
					<title>Add Line</title>
					<path
						d="M22 22 L2 2 Z"
						fill="none"
						stroke="#D0D4E0"
						strokeWidth="1px"
					/>
				</svg>
			</CanvasMenuItem>
			<CanvasMenuItem
				onClick={() =>
					onNewDiagram?.({
						eventId: newEventId(),
						diagramType: "TextAreaNode",
						isSelected: true,
					})
				}
			>
				T
			</CanvasMenuItem>
			<CanvasMenuItem
				onClick={() =>
					onNewDiagram?.({
						eventId: newEventId(),
						diagramType: "LLMNode",
						isSelected: true,
					})
				}
			>
				AI
			</CanvasMenuItem>
			<CanvasMenuItem
				onClick={() =>
					onNewDiagram?.({
						eventId: newEventId(),
						diagramType: "SvgToDiagramNode",
						isSelected: true,
					})
				}
			>
				SVG
			</CanvasMenuItem>
			<CanvasMenuItem
				onClick={() =>
					onNewDiagram?.({
						eventId: newEventId(),
						diagramType: "HubNode",
						isSelected: true,
					})
				}
			>
				※
			</CanvasMenuItem>
			<CanvasMenuItem
				onClick={() =>
					onNewDiagram?.({
						eventId: newEventId(),
						diagramType: "ImageGenNode",
						isSelected: true,
					})
				}
			>
				IMG
			</CanvasMenuItem>
			<CanvasMenuItem
				onClick={() =>
					onNewDiagram?.({
						eventId: newEventId(),
						diagramType: "AgentNode",
						isSelected: true,
					})
				}
			>
				AG
			</CanvasMenuItem>
			<CanvasMenuItem
				onClick={() =>
					onNewDiagram?.({
						eventId: newEventId(),
						diagramType: "PageDesignNode",
						isSelected: true,
					})
				}
			>
				PD
			</CanvasMenuItem>
			<CanvasMenuItem
				onClick={() =>
					onNewDiagram?.({
						eventId: newEventId(),
						diagramType: "WebSearchNode",
						isSelected: true,
					})
				}
			>
				WB
			</CanvasMenuItem>
			<CanvasMenuItem
				onClick={() =>
					onNewDiagram?.({
						eventId: newEventId(),
						diagramType: "VectorStoreNode",
						isSelected: true,
					})
				}
			>
				VS
			</CanvasMenuItem>
		</CanvasMenuDiv>
	);
};

export const CanvasMenu = memo(CanvasMenuComponent);
