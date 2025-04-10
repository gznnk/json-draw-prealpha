// Import Emotion for styling.
import styled from "@emotion/styled";

/**
 * Properties for the ContextMenuContainer.
 */
type ContextMenuDivProps = {
	x: number;
	y: number;
};

/**
 * Style for the context menu.
 */
export const ContextMenuDiv = styled.div<ContextMenuDivProps>`
    position: absolute;
    top: ${(props) => props.y}px;
    left: ${(props) => props.x}px;
    min-width: 200px;
    padding: 3px 4px;
    background-color: #F9F9F9;
    border: 1px solid #E0E0E0;
    border-radius: 4px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    pointer-events: auto;
    user-select: none;
`;

/**
 * Styled div element for context menu divider.
 * This is used to separate different sections of the context menu.
 */
export const ContextMenuDivider = styled.div`
	height: 1px;
	margin-top: 3px;
	margin-bottom: 3px;
	background-color: #E0E0E0;
`;
