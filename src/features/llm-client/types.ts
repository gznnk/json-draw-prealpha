/**
 * 単一のメッセージを表す型定義.
 * AIとのインタラクションにおける各メッセージを定義します.
 */
export type MessageParam = {
	role: "system" | "user" | "assistant";
	content: string;
};

/**
 * ツールパラメータの定義.
 */
export type ToolParameter = {
	name: string;
	description: string;
};

/**
 * LLMで使用可能なツールの定義.
 */
export type ToolDefinition = {
	name: string;
	description: string;
	parameters: ToolParameter[];
};
