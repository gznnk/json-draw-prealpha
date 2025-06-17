import styled from "@emotion/styled";

/**
 * Container for the MiniMap component
 */
export const MiniMapContainer = styled.div<{ width: number; height: number }>`
	position: absolute;
	top: 16px;
	right: 16px;
	width: ${(props) => props.width}px;
	height: ${(props) => props.height}px;
	background-color: #1A1F33;
	border: 1px solid #2A2F4C;
	border-radius: 4px;
	cursor: pointer;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
	overflow: hidden;
	z-index: 1000;
	pointer-events: auto;
`;

/**
 * SVG element for the MiniMap
 */
export const MiniMapSvg = styled.svg`
	width: 100%;
	height: 100%;
	display: block;
	pointer-events: auto;
`;

/**
 * Background rectangle for the minimap
 */
export const MiniMapBackground = styled.rect`
	fill: #0C0F1C;
`;

/**
 * Viewport indicator rectangle
 */
export const ViewportIndicator = styled.rect`
	fill: transparent;
	stroke: #4EA1FF;
	stroke-width: 1;
	opacity: 0.8;
	cursor: grab;
	pointer-events: all;
	
	&:hover {
		stroke-width: 2;
		opacity: 1;
	}
	
	&:active {
		cursor: grabbing;
		stroke-width: 2;
		opacity: 1;
	}
`;

/**
 * Item representation in the minimap
 */
export const MiniMapItem = styled.rect`
	fill: #C0C4D2;
	opacity: 0.6;
`;
