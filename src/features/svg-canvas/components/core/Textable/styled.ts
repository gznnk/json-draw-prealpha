// Import Emotion for styling.
import styled from "@emotion/styled";

// Import types related to SvgCanvas.
import type { TextAlign, VerticalAlign } from "../../../types/DiagramTypes";

// Imports related to this component.
import { TextAlignMap, VerticalAlignMap } from "./constants";

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
    border: none;
    outline: none;
    background: transparent;
    pointer-events: none;
    user-select: none;
    overflow: hidden;
    word-break: ${(props) => props.wordBreak};
    white-space: ${(props) => props.whiteSpace};
    padding: 2px;
    box-sizing: border-box;
`;

/**
 * テキストエディタ要素のプロパティ
 */
type TextEditorTextAreaProps = {
	left: number;
	top: number;
	transform: string;
	width: number;
	height: number;
	textAlign: string;
	verticalAlign: string;
	color: string;
	fontSize: number;
	fontFamily: string;
};

/**
 * Style for TextEditorInput.
 */
export const TextEditorInput = styled.input<TextEditorTextAreaProps>`
    position: absolute;
    left: ${(props) => props.left}px;
    top: ${(props) => props.top}px;
    transform: ${(props) => props.transform};
    width: ${(props) => props.width}px;
    height: ${(props) => props.height}px;
    text-align: ${(props) => props.textAlign};
    vertical-align: ${(props) => props.verticalAlign};
    color: ${(props) => props.color};
    font-size: ${(props) => props.fontSize}px;
    font-family: ${(props) => props.fontFamily};
    background: transparent;
    border: none;
    outline: none;
    overflow: hidden;
    resize: none;
    box-sizing: border-box;
    padding: 2px;
    pointer-events: auto;
`;

/**
 * テキストエディタ要素
 */
export const TextEditorTextArea = styled.textarea<TextEditorTextAreaProps>`
    position: absolute;
    left: ${(props) => props.left}px;
    top: ${(props) => props.top}px;
    transform: ${(props) => props.transform};
    width: ${(props) => props.width}px;
    height: ${(props) => props.height}px;
    text-align: ${(props) => props.textAlign};
    vertical-align: ${(props) => props.verticalAlign};
    color: ${(props) => props.color};
    font-size: ${(props) => props.fontSize}px;
    font-family: ${(props) => props.fontFamily};
    background: transparent;
    border: none;
    outline: none;
    overflow: hidden;
    resize: none;
    box-sizing: border-box;
    padding: 2px;
    pointer-events: auto;
`;
