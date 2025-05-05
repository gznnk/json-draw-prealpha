// Import other libraries.
import DOMPurify from "dompurify";
import hljs from "highlight.js";
import katex from "katex";
import MarkdownIt from "markdown-it";

// Import other libraries css.
import "highlight.js/styles/github.css";
import "katex/dist/katex.min.css";

// 行頭 $$ と行末 $$ を単独行にして markdown-it に渡す
const normalizeMath = (text: string) => {
	return (
		text
			// \[...\] → $$\n...\n$$
			.replace(/\\\[(.*?)\\\]/gs, (_, inner) => `\n$$\n${inner}\n$$\n`)
			// 既存の $$...$$ が行内にある場合も強制的に改行
			.replace(/\$\$([^$\n]+?)\$\$/gs, (_, inner) => `\n$$\n${inner}\n$$\n`)
	);
};

const katexLite = (md: MarkdownIt) => {
	/* ---------- Inline $ ... $ ---------- */
	md.inline.ruler.after("escape", "math_inline", (state, silent) => {
		if (state.src[state.pos] !== "$") return false;
		const start = state.pos + 1;
		const end = state.src.indexOf("$", start);
		if (end === -1 || end === start) return false;
		if (silent) return false;

		const token = state.push("math_inline", "", 0);
		token.content = state.src.slice(start, end);
		state.pos = end + 1;
		return true;
	});

	/* ---------- Block $$ ... $$ ---------- */
	md.block.ruler.after(
		"fence",
		"math_block",
		(state, startLine, endLine, silent) => {
			const begin = state.bMarks[startLine] + state.tShift[startLine];
			if (state.src.slice(begin, begin + 2) !== "$$") return false;

			let next = startLine;
			while (++next < endLine) {
				const pos = state.bMarks[next] + state.tShift[next];
				if (state.src.slice(pos, pos + 2) === "$$") break;
			}
			if (next >= endLine) return false;
			if (silent) return true;

			const token = state.push("math_block", "", 0);
			const firstLine = state.src
				.slice(begin + 2, state.eMarks[startLine])
				.trim();
			const lastLine = state.src
				.slice(state.bMarks[next] + state.tShift[next] + 2, state.eMarks[next])
				.trim();
			token.content = `${firstLine ? `${firstLine}\n` : ""}${state.getLines(startLine + 1, next, state.tShift[startLine], true)}${lastLine || ""}`;
			token.map = [startLine, next + 1];
			state.line = next + 1;
			return true;
		},
		{ alt: ["paragraph", "reference", "blockquote", "list"] },
	);

	/* ---------- Renderer ---------- */
	md.renderer.rules.math_inline = (t, i) =>
		katex.renderToString(t[i].content, { throwOnError: false });

	md.renderer.rules.math_block = (t, i) =>
		`<div class="math-block">${katex.renderToString(t[i].content, {
			displayMode: true,
			throwOnError: false,
		})}</div>`;
};

// MarkdownItインスタンス作成
const md = new MarkdownIt({
	html: true,
	breaks: true,
	linkify: true,
	highlight: (str: string, lang: string): string => {
		if (lang && hljs.getLanguage(lang)) {
			return `<pre><code class="hljs language-${lang}">${hljs.highlight(str, { language: lang }).value}</code></pre>`;
		}
		return `<pre><code>${md.utils.escapeHtml(str)}</code></pre>`;
	},
}).use(katexLite);

export const renderMarkdown = (text: string): string => {
	return DOMPurify.sanitize(md.render(normalizeMath(text)));
};
