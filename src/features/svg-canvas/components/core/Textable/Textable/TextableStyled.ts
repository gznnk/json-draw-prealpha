// Import Emotion for styling.
import styled from "@emotion/styled";

// Import types related to SvgCanvas.
import type { TextAlign, VerticalAlign } from "../../../../types/DiagramTypes";

// Imports related to this component.
import { TextAlignMap, VerticalAlignMap } from "./TextableConstants";

/**
 * Props for the wrapper element that aligns the text vertically.
 */
type TextWrapperProps = {
	verticalAlign: VerticalAlign;
};

/**
 * Styled wrapper element for vertical text alignment.
 */
export const TextWrapper = styled.div<TextWrapperProps>`
    display: flex;
    width: 100%;
    height: 100%;
    align-items: ${(props) => VerticalAlignMap[props.verticalAlign]};
`;

/**
 * Props for the text display element.
 */
type TextProps = {
	textAlign: TextAlign;
	color: string;
	fontSize: number;
	fontFamily: string;
	fontWeight: string;
	wordBreak: string;
	whiteSpace: string;
};

/**
 * Styled div element for displaying text.
 */
export const Text = styled.div<TextProps>`
    width: 100%;
    text-align: ${(props) => TextAlignMap[props.textAlign]};
    color: ${(props) => props.color};
    font-size: ${(props) => props.fontSize}px;
    font-family: ${(props) => props.fontFamily};
    font-weight: ${(props) => props.fontWeight};
    border: none;
    outline: none;
    background: transparent;
    pointer-events: none;
    user-select: none;
    overflow: hidden;
    word-break: ${(props) => props.wordBreak};
    white-space: ${(props) => props.whiteSpace};
    padding: 2px 6px;
    box-sizing: border-box;
    & p {
        margin: 0;
    }
    & ul {
        padding-inline-start: 1.8em;
    }
    & ol {
        padding-inline-start: 1.8em;
    }
    & li {
        margin: 0;
        padding: 0;
    }
    & h1 {
        margin: 0;
    }
    & h2 {
        margin: 0;
    }
    & h3 {
        margin: 0;
    }
    & h4 {
        margin: 0;
    }
    & h5 {
        margin: 0;
    }
    & h6 {
        margin: 0;
    }
    & a {
        pointer-events: auto;
    }
    pre code.hljs {
        background: #f9f9f9;
        border-radius: 6px;
        border: 1px solid #d4d4d4;
        overflow: hidden;
    }
`;
