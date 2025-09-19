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
	padding: 4px 0;
	background-color: #ffffff;
	border: 1px solid #d9d9d9;
	border-radius: 6px;
	box-shadow:
		0 2px 8px rgba(0, 0, 0, 0.06),
		0 1px 2px rgba(0, 0, 0, 0.04);
	pointer-events: auto;
	user-select: none;
	z-index: 1050;
`;

/**
 * Styled div element for context menu divider.
 * This is used to separate different sections of the context menu.
 */
export const ContextMenuDivider = styled.div`
	height: 1px;
	margin: 4px 12px;
	background-color: #f0f0f0;
`;
