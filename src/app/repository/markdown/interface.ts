import type { Markdown } from "../../model/Markdown";

export interface MarkdownRepository {
	saveMarkdowns(markdowns: Markdown[]): Promise<void>;
	getMarkdowns(): Promise<Markdown[]>;
	updateMarkdown(markdown: Markdown): Promise<void>;
	getMarkdownById(id: string): Promise<Markdown | undefined>;
	deleteMarkdownById(id: string): Promise<void>;
}
