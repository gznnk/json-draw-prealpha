// Reactのインポート
import type React from "react";
import { useState, memo, useEffect, useRef } from "react";

// ライブラリのインポート
import styled from "@emotion/styled";

// SvgCanvas関連型定義をインポート
import type {
	TextAlign,
	VerticalAlign,
	TextableData,
	TextableType,
} from "../../types/DiagramTypes";
import type { DiagramTextChangeEvent } from "../../types/EventTypes";

// SvgCanvas関連関数をインポート
import { createSvgTransform } from "../../functions/Diagram";
import { degreesToRadians } from "../../functions/Math";
import { newEventId } from "../../functions/Util";

/**
 * テキストの水平方向の配置をCSSスタイルに変換するマップ
 */
const TextAlignMap: Record<TextAlign, React.CSSProperties["textAlign"]> = {
	left: "left",
	center: "center",
	right: "right",
};

/**
 * テキストの垂直方向の配置をCSSスタイルに変換するマップ
 */
const VerticalAlignMap: Record<
	VerticalAlign,
	React.CSSProperties["alignItems"]
> = {
	top: "start",
	center: "center",
	bottom: "end",
};

/**
 * テキスト表示用Div要素のラッパー要素のプロパティ
 */
type TextWapperProps = {
	verticalAlign: VerticalAlign;
};

/**
 * テキスト表示用Div要素のラッパー要素
 */
const TextWapper = styled.div<TextWapperProps>`
	display: flex;
	width: 100%;
	height: 100%;
	align-items: ${(props) => VerticalAlignMap[props.verticalAlign]};
`;

/**
 * テキスト表示用Div要素のプロパティ
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
 * テキスト表示用Div要素
 */
const Text = styled.div<TextProps>`
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
 * テキストコンポーネントのプロパティ
 */
type TextableProps = TextableData & {
	x: number;
	y: number;
	width: number;
	height: number;
	transform: string;
};

/**
 * テキストコンポーネント
 */
const Textable: React.FC<TextableProps> = ({
	x,
	y,
	width,
	height,
	transform,
	text,
	textType,
	textAlign,
	verticalAlign,
	fontColor,
	fontSize,
	fontFamily,
	isTextEditing,
}) => {
	if (!text) return null;
	if (isTextEditing) return null;

	return (
		<foreignObject
			className="diagram"
			x={x}
			y={y}
			width={width}
			height={height}
			transform={transform}
			pointerEvents="none"
		>
			<TextWapper verticalAlign={verticalAlign}>
				<Text
					textAlign={textAlign}
					color={fontColor}
					fontSize={fontSize}
					fontFamily={fontFamily}
					wordBreak={textType === "textarea" ? "break-word" : "normal"}
					whiteSpace={textType === "textarea" ? "pre-wrap" : "nowrap"}
				>
					{text}
				</Text>
			</TextWapper>
		</foreignObject>
	);
};

export default memo(Textable);

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
const TextEditorInput = styled.input<TextEditorTextAreaProps>`
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
const TextEditorTextArea = styled.textarea<TextEditorTextAreaProps>`
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
 * テキストエディタのプロパティ
 */
export type TextEditorProps = {
	id: string;
	text: string;
	x: number;
	y: number;
	width: number;
	height: number;
	scaleX: number;
	scaleY: number;
	rotation: number;
	textType: TextableType;
	textAlign: TextAlign;
	verticalAlign: VerticalAlign;
	fontColor: string;
	fontSize: number;
	fontFamily: string;
	isActive: boolean;
	onTextChange?: (e: DiagramTextChangeEvent) => void;
};

/**
 * テキストエディタコンポーネント
 */
export const TextEditor: React.FC<TextEditorProps> = memo(
	({
		id,
		text,
		x,
		y,
		width,
		height,
		scaleX,
		scaleY,
		rotation,
		textType,
		textAlign,
		verticalAlign,
		fontColor,
		fontSize,
		fontFamily,
		isActive,
		onTextChange,
	}) => {
		const inputRef = useRef<HTMLInputElement>(null);
		const textAreaRef = useRef<HTMLTextAreaElement>(null);

		const [inputText, setInputText] = useState(text);

		useEffect(() => {
			if (isActive) {
				setInputText(text);
				if (textType === "textarea") {
					textAreaRef.current?.focus();
					textAreaRef.current?.setSelectionRange(text.length, text.length);
				} else {
					inputRef.current?.focus();
					inputRef.current?.setSelectionRange(text.length, text.length);
				}
			} else {
				setInputText("");
			}
		}, [isActive, text, textType]);

		if (!isActive) return null;

		const transform = createSvgTransform(
			scaleX,
			scaleY,
			degreesToRadians(rotation),
			x,
			y,
		);

		const handleTextAreaChange = (
			e: React.ChangeEvent<HTMLTextAreaElement>,
		) => {
			setInputText(e.target.value);
		};

		const handleTextAreaBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
			onTextChange?.({
				eventId: newEventId(),
				id,
				text: e.target.value,
			});
		};

		const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			setInputText(e.target.value);
		};

		const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
			onTextChange?.({
				eventId: newEventId(),
				id,
				text: e.target.value,
			});
		};

		return textType === "textarea" ? (
			<TextEditorTextArea
				value={inputText}
				left={-width / 2}
				top={-height / 2}
				transform={transform}
				width={width}
				height={height}
				textAlign={textAlign}
				verticalAlign={verticalAlign}
				color={fontColor}
				fontSize={fontSize}
				fontFamily={fontFamily}
				ref={textAreaRef}
				onChange={handleTextAreaChange}
				onBlur={handleTextAreaBlur}
			/>
		) : (
			<TextEditorInput
				type="text"
				value={inputText}
				left={-width / 2}
				top={-height / 2}
				transform={transform}
				width={width}
				height={height}
				textAlign={textAlign}
				verticalAlign={verticalAlign}
				color={fontColor}
				fontSize={fontSize}
				fontFamily={fontFamily}
				ref={inputRef}
				onChange={handleInputChange}
				onBlur={handleInputBlur}
			/>
		);
	},
);
