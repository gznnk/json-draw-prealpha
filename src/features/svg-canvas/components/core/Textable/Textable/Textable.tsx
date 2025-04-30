// Import React.
import type React from "react";
import { memo, useEffect, useRef } from "react";

// Import other libraries.
import DOMPurify from "dompurify";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";
import { marked } from "marked";

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
		link({ href, title, text }) {
			const titleAttr = title ? ` title="${title}"` : "";
			return `<a href="${href}" target="_blank" rel="noopener noreferrer"${titleAttr}>${text}</a>`;
		},
	},
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
			textRef.current.innerHTML = marked(DOMPurify.sanitize(text), {
				async: false,
			}); // Set the new content
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
