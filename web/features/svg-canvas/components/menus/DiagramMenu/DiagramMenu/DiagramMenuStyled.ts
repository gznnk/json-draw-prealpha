import styled from "@emotion/styled";

/**
 * Properties for the DiagramMenuWrapper.
 */
type DiagramMenuWrapperProps = {
	x: number;
	y: number;
	zoom: number;
};

/**
 * Styled element for the diagram menu wrapper.
 */
export const DiagramMenuWrapper = styled.div<DiagramMenuWrapperProps>`
	position: absolute;
	top: ${(props) => props.y}px;
	left: ${(props) => props.x - 300 * props.zoom}px;
	width: ${(props) => 600 * props.zoom}px;
	display: flex;
	justify-content: center;
`;

/**
 * Styled element for the diagram menu.
 */
export const DiagramMenuDiv = styled.div`
	height: 40px;
	box-sizing: border-box;
	display: flex;
	flex-direction: row;
	align-items: center;
	font-size: 14px;
	padding: 4px 8px;
	background-color: #ffffff;
	border: 1px solid #d9d9d9;
	border-radius: 6px;
	box-shadow:
		0 2px 8px rgba(0, 0, 0, 0.06),
		0 1px 2px rgba(0, 0, 0, 0.04);
	pointer-events: auto;
	user-select: none;
	z-index: 1000;
`;

/**
 * Styled element for the diagram menu divider.
 */
export const DiagramMenuDivider = styled.div`
	width: 1px;
	height: 16px;
	margin: 0 8px;
	background-color: #f0f0f0;
	align-self: center;
`;

/**
 * Styled element for the diagram menu controll positioning.
 */
export const DiagramMenuPositioner = styled.div`
	position: relative;
	display: flex;
	flex-direction: row;
`;
