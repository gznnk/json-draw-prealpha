// Import Emotion for styling.
import styled from "@emotion/styled";

export const Viewport = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
`;

/**
 * Styled wrapper element for the SVG canvas.
 */
export const Container = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
`;

/**
 * Props for the SVG element for grab scroll functionality.
 */
type SvgProps = {
	isGrabScrollReady?: boolean;
	isGrabScrolling?: boolean;
};

/**
 * Styled SVG element for rendering the diagram.
 */
export const Svg = styled.svg<SvgProps>`
    display: block;
    box-sizing: border-box;
    background-color: #eeeeee;
    outline: none;
    cursor: ${(props) => {
			if (props.isGrabScrolling) return "grabbing";
			if (props.isGrabScrollReady) return "grab";
			return "default";
		}};
    * {
        outline: none;
    }
`;

/**
 * Props for the wrapper element that contains HTML elements.
 */
type HTMLElementsContainerProps = {
	left: number;
	top: number;
	width: number;
	height: number;
	zoom?: number;
};

/**
 * Styled wrapper element for containing HTML elements.
 */
export const HTMLElementsContainer = styled.div<HTMLElementsContainerProps>`
    position: absolute;
    left: ${(props) => props.left}px;
    top: ${(props) => props.top}px;
    width: ${(props) => props.width}px;
    height: ${(props) => props.height}px;
    transform: ${(props) => (props.zoom ? `scale(${props.zoom})` : "none")};
    transform-origin: top left;
    pointer-events: none;
`;

/**
 * Styled element for the viewport overlay.
 */
export const ViewportOverlay = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
    pointer-events: none;
`;

/**
 * Props for the selection rectangle element.
 */
type SelectionRectProps = {
	x: number;
	y: number;
	width: number;
	height: number;
	visible: boolean;
};

/**
 * Styled selection rectangle for area selection.
 */
export const SelectionRect = styled.rect<SelectionRectProps>`
    fill: rgba(58, 121, 184, 0.1);
    stroke: #3A79B8;
    stroke-width: 1;
    stroke-dasharray: 5,5;
    pointer-events: none;
    visibility: ${(props) => (props.visible ? "visible" : "hidden")};
`;
