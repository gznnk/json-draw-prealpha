// Import React library.
import type React from "react";

// Import other libraries.
import styled from "@emotion/styled";

// Import SvgCanvas related types.
import type { NewDiagramEvent } from "../../types/EventTypes";

const CanvasMenuDiv = styled.div`
    position: absolute;
    top: 10px;
    left: 10px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    background-color: #f0f0f0;
    padding: 6px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border-radius: 4px;
`;

type CanvasMenuProps = {
	onNewDiagram?: (e: NewDiagramEvent) => void;
};

const CanvasMenu: React.FC<CanvasMenuProps> = ({ onNewDiagram }) => {
	return (
		<CanvasMenuDiv>
			<IconButton
				onClick={() =>
					onNewDiagram?.({
						diagramType: "Rectangle",
					})
				}
			>
				□
			</IconButton>
			<IconButton
				onClick={() =>
					onNewDiagram?.({
						diagramType: "Ellipse",
					})
				}
			>
				〇
			</IconButton>
		</CanvasMenuDiv>
	);
};

export default CanvasMenu;

const IconButtonElm = styled.button`
    width: 36px;
    height: 36px;
    border: none;
    padding: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: auto;
`;

type IconButtonProps = {
	onClick?: () => void;
	children: React.ReactNode;
};

const IconButton: React.FC<IconButtonProps> = ({ onClick, children }) => {
	return (
		<IconButtonElm type="button" onClick={onClick}>
			{children}
		</IconButtonElm>
	);
};
