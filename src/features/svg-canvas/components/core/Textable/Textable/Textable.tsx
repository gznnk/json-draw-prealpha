// Import React.
import type React from "react";
import { memo, useEffect, useRef } from "react";

// Import other libraries.
import DOMPurify from "dompurify";
import hljs from "highlight.js";
import katex from "katex";
import { marked, type Tokens } from "marked";

// Import other libraries css.
import "highlight.js/styles/github.css";
import "katex/dist/katex.min.css";

// Import types related to SvgCanvas.
import type { TextableData } from "../../../../types/DiagramTypes";

// Imports related to this component.
import { Text, TextWrapper } from "./TextableStyled";

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

// 共通のmath拡張を生成
const createMathExtension = (
	name: string,
	level: "inline" | "block",
	pattern: RegExp,
	displayMode = false,
) => ({
	name,
	level,
	start: (src: string) => src.match(pattern)?.index,
	tokenizer: (src: string) => {
		const match = src.match(pattern);
		if (match) {
			return {
				type: name,
				raw: match[0],
				text: match[1],
				tokens: [],
			};
		}
	},
	renderer: (token: Tokens.Generic) =>
		displayMode
			? `<div class="math-block">${katex.renderToString(token.text, {
					displayMode: true,
					throwOnError: false,
				})}</div>`
			: katex.renderToString(token.text, { throwOnError: false }),
});

marked.use({
	renderer: {
		code({ text, lang }) {
			// If no language is specified, return the text as plaintext.
			if (!lang) return `<pre><code>${text}</code></pre>`;

			// If a language is specified, use highlight.js to highlight the code.
			const validLang = hljs.getLanguage(lang ? lang : "plaintext");
			const highlighted = hljs.highlight(text, {
				language: lang ?? "plaintext",
			}).value;
			return `<pre><code class="hljs language-${validLang}">${highlighted}</code></pre>`;
		},
	},
	extensions: [
		createMathExtension("math", "inline", /^\$([^$]+?)\$/),
		createMathExtension("mathBlock", "block", /^\$\$([^$]+?)\$\$/s, true),
		createMathExtension("mathInline", "inline", /^\\\((.+?)\\\)/),
		createMathExtension("mathBlockAlt", "block", /^\\\[(.+?)\\\]/s, true),
	],
});

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
	fontWeight,
	isTextEditing,
}) => {
	const textRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (textRef.current && !isTextEditing) {
			textRef.current.innerHTML = ""; // Clear the previous content
			textRef.current.innerHTML = DOMPurify.sanitize(
				marked(text, {
					async: false,
				}),
			); // Set the new content
			for (const link of textRef.current.querySelectorAll("a")) {
				link.setAttribute("target", "_blank");
				link.setAttribute("rel", "noopener noreferrer");
			}
		}
	}, [text, isTextEditing]);

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
				{textType === "markdown" ? (
					<Text
						textAlign={textAlign}
						color={fontColor}
						fontSize={fontSize}
						fontFamily={fontFamily}
						fontWeight={fontWeight}
						wordBreak="break-word"
						whiteSpace="pre-wrap"
						ref={textRef}
					/>
				) : (
					<Text
						textAlign={textAlign}
						color={fontColor}
						fontSize={fontSize}
						fontFamily={fontFamily}
						fontWeight={fontWeight}
						wordBreak={textType === "text" ? "normal" : "break-word"}
						whiteSpace={textType === "text" ? "nowrap" : "pre-wrap"}
					>
						{text}
					</Text>
				)}
			</TextWrapper>
		</foreignObject>
	);
};

export const Textable = memo(TextableComponent);
