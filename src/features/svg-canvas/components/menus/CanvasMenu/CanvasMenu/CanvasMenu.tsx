// Import React.
import type React from "react";
import { memo } from "react";

// Import types related to SvgCanvas.
import type { AddDiagramByTypeEvent } from "../../../../types/events/AddDiagramByTypeEvent";

// Import functions related to SvgCanvas.
import { newEventId } from "../../../../utils/core/newEventId";

// Imports related to this component.
import { CanvasMenuDiv } from "./CanvasMenuStyled";
import { CanvasMenuItem } from "../CanvasMenuItem";

type CanvasMenuProps = {
	onAddDiagramByType?: (e: AddDiagramByTypeEvent) => void;
};

const CanvasMenuComponent: React.FC<CanvasMenuProps> = ({
	onAddDiagramByType,
}) => {
	return (
		<CanvasMenuDiv draggable={false}>
			<CanvasMenuItem
				onClick={() =>
					onAddDiagramByType?.({
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
					onAddDiagramByType?.({
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
					onAddDiagramByType?.({
						eventId: newEventId(),
						diagramType: "Button",
						isSelected: true,
					})
				}
			>
				<svg width="20" height="20" viewBox="0 0 24 24">
					<title>Add Button</title>
					<rect
						x="2"
						y="8"
						width="20"
						height="8"
						rx="4"
						ry="4"
						fill="none"
						stroke="#D0D4E0"
					/>
					<text
						x="12"
						y="13"
						fontSize="6"
						textAnchor="middle"
						fill="#D0D4E0"
					>
						BTN
					</text>
				</svg>
			</CanvasMenuItem>
			<CanvasMenuItem
				onClick={() =>
					onAddDiagramByType?.({
						eventId: newEventId(),
						diagramType: "Input",
						isSelected: true,
					})
				}
			>
				<svg width="20" height="20" viewBox="0 0 24 24">
					<title>Add Input</title>
					<rect
						x="2"
						y="9"
						width="20"
						height="6"
						rx="1"
						ry="1"
						fill="none"
						stroke="#D0D4E0"
					/>
					<line
						x1="4"
						y1="12"
						x2="4"
						y2="12"
						stroke="#D0D4E0"
						strokeWidth="1"
					/>
				</svg>
			</CanvasMenuItem>
			<CanvasMenuItem
				onClick={() =>
					onAddDiagramByType?.({
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
					onAddDiagramByType?.({
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
					onAddDiagramByType?.({
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
					onAddDiagramByType?.({
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
					onAddDiagramByType?.({
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
					onAddDiagramByType?.({
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
					onAddDiagramByType?.({
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
					onAddDiagramByType?.({
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
					onAddDiagramByType?.({
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
					onAddDiagramByType?.({
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
