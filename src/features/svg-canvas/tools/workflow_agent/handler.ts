// Import libraries.
import { LLMClientFactory } from "../../../llm-client";
import type { FunctionHandlerMap } from "../../../llm-client/types";

// Import utilities.
import { OpenAiKeyManager } from "../../../../utils/KeyManager";

// Import ai tools.
import { addImageGenNode } from "../add_image_gen_node";
import { addLLMNode } from "../add_llm_node";
import { addSvgToCanvasNode } from "../add_svg_to_canvas_node";
import { addTextNode } from "../add_text_node";
import { connectNodes } from "../connect_nodes";

// Import prompt.
import AI_AGENT_INSTRUCTIONS from "./prompts/agent-instructions.md?raw";

/**
 * ワークフローエージェントで使用可能なツール定義のリスト
 */
export const AI_TOOLS = [
	addImageGenNode.definition,
	addLLMNode.definition,
	addTextNode.definition,
	addSvgToCanvasNode.definition,
	connectNodes.definition,
];

/**
 * llm-client用のFunctionHandlerMap
 * 各ツールのハンドラーを直接利用します
 */
const functionHandlerMap: FunctionHandlerMap = {
	add_image_gen_node: addImageGenNode.handler,
	add_llm_node: addLLMNode.handler,
	add_text_node: addTextNode.handler,
	add_svg_to_canvas_node: addSvgToCanvasNode.handler,
	connect_nodes: connectNodes.handler,
};

// Import FunctionCallHandler type
import type {
	FunctionCallHandler,
	FunctionCallInfo,
} from "../../../llm-client/types";

/**
 * ワークフローエージェントのハンドラー関数
 * ユーザーの目標に基づいてワークフローを自動生成します
 *
 * @param functionCall - 関数コール情報（user_goalを含む）
 * @returns 成功/失敗状態とコンテンツを含む結果オブジェクト、またはnull
 */
export const handler: FunctionCallHandler = async (
	functionCall: FunctionCallInfo,
) => {
	const args = functionCall.arguments as { user_goal: string };

	if (typeof args.user_goal === "string") {
		// APIキーの取得
		const storedApiKey = OpenAiKeyManager.loadKey();
		if (!storedApiKey) return { success: false, content: "API key not found." };

		// 出力テキスト用の変数
		let outputContent = "";

		try {
			// LLMClientFactoryを使用してクライアントを作成
			const llmClient = LLMClientFactory.createClient(storedApiKey, {
				tools: AI_TOOLS,
				systemPrompt: AI_AGENT_INSTRUCTIONS,
				functionHandlers: functionHandlerMap,
			});

			// ユーザーのゴールとキャンバス配置指示をメッセージとして送信
			const userMessage = `${args.user_goal}\n\nStart placing the first node near (X: ${300}, Y: ${200}) on the canvas.`;

			// チャットを実行し、レスポンスを処理
			await llmClient.chat({
				message: userMessage,
				onTextChunk: (textChunk) => {
					// テキストチャンクを蓄積
					outputContent += textChunk;
				},
			});

			// 成功レスポンスを返す
			return {
				success: true,
				content: outputContent || "Workflow generation completed.",
			};
		} catch (error) {
			console.error("Error in workflow agent:", error);
			return {
				success: false,
				content: "Error generating workflow.",
			};
		}
	}

	return {
		success: false,
		content: "Invalid arguments: user_goal is required.",
	};
};
