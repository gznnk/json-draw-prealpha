// Import React.
import type React from "react";
import { memo, useEffect, useRef, useState } from "react";

// Import types related to SvgCanvas.
import type {
	TextableData,
	TextableType,
	TextAlign,
	VerticalAlign,
} from "../../../types/DiagramTypes";
import type { DiagramTextChangeEvent } from "../../../types/EventTypes";

// Import functions related to SvgCanvas.
import { newEventId } from "../../../utils/Util";
import { createSvgTransform } from "../../../utils/Diagram";
import { degreesToRadians } from "../../../utils/Math";

// Imports related to this component.
import {
	Text,
	TextEditorInput,
	TextEditorTextArea,
	TextWrapper,
} from "./styled";

/**
 * Props for rendering editable text inside the SVG shape.
 */
type TextableProps = TextableData & {
	x: number;
	y: number;
	width: number;
	height: number;
	transform: string;
};

/**
 * React component for rendering editable text inside the SVG shape.
 */
const TextableComponent: React.FC<TextableProps> = ({
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
			<TextWrapper verticalAlign={verticalAlign}>
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
			</TextWrapper>
		</foreignObject>
	);
};

export const Textable = memo(TextableComponent);

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
