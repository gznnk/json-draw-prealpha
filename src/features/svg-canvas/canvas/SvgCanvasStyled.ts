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
    overflow: auto;
`;

/**
 * Props for the content wrapper element with zoom support.
 */
type ContentWrapperProps = {
	zoom: number;
	contentWidth: number;
	contentHeight: number;
};

/**
 * Styled wrapper element for the content that scales with zoom.
 */
export const ContentWrapper = styled.div<ContentWrapperProps>`
    position: relative;
    width: ${(props) => props.contentWidth * props.zoom}px;
    height: ${(props) => props.contentHeight * props.zoom}px;
`;

/**
 * Props for the Svg element with zoom support.
 */
type SvgProps = {
	zoom: number;
	contentWidth: number;
	contentHeight: number;
};

/**
 * Styled SVG element for rendering the diagram.
 */
export const Svg = styled.svg<SvgProps>`
    display: block;
    box-sizing: border-box;
    background-color: #eeeeee;
    outline: none;
    width: ${(props) => props.contentWidth}px;
    height: ${(props) => props.contentHeight}px;
    transform: scale(${(props) => props.zoom});
    transform-origin: 0 0;
    * {
        outline: none;
    }
`;

/**
 * Styled wrapper element for the multi-select group.
 */
export const MultiSelectGroupContainer = styled.g`
    .diagram {
        opacity: 0;
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
	zoom: number;
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
    transform: scale(${(props) => props.zoom});
    transform-origin: 0 0;
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
