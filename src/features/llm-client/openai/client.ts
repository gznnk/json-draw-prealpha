import OpenAI from "openai";
import type { LLMClient, ChatParams } from "../interface";
import type { MessageParam, ToolDefinition } from "../types";

/**
 * OpenAIを使用したLLMクライアントの実装.
 * 会話履歴を内部で管理し、APIとの通信を行います.
 */
export class OpenAIClient implements LLMClient {
	private readonly openai: OpenAI;
	private readonly tools?: ToolDefinition[];
	private messages: MessageParam[] = [];

	/**
	 * OpenAIクライアントを初期化します.
	 *
	 * @param apiKey - OpenAI APIキー
	 * @param tools - 利用可能なツール定義のリスト
	 * @param systemPrompt - システムプロンプト (任意)
	 */
	constructor(apiKey: string, tools?: ToolDefinition[], systemPrompt?: string) {
		this.openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
		this.tools = tools;

		// システムプロンプトが指定されていれば初期メッセージとして追加
		if (systemPrompt) {
			this.messages.push({
				role: "system",
				content: systemPrompt,
			});
		}
	}
	/**
	 * ユーザーメッセージを送信し、AIからの応答を処理します.
	 *
	 * @param params - チャットパラメータ
	 */
	async chat({ message, onTextChunk }: ChatParams): Promise<void> {
		// ユーザーメッセージを会話履歴に追加
		this.messages.push({
			role: "user",
			content: message,
		});
		// OpenAI形式のツール定義に変換
		const openaiTools = this.tools?.map((tool) => ({
			type: "function",
			name: tool.name,
			description: tool.description,
			parameters: {
				type: "object",
				properties: tool.parameters.reduce(
					(acc, param) => {
						acc[param.name] = {
							type: "string",
							description: param.description,
						};
						return acc;
					},
					{} as Record<string, unknown>,
				),
				additionalProperties: false,
				required: this.tools?.map((t) => t.name) || [],
			},
			strict: true,
		})) as OpenAI.Responses.Tool[] | undefined;

		// メッセージ履歴をOpenAI形式に変換
		const openaiMessages = this.messages.map((msg) => ({
			role: msg.role,
			content: msg.content,
		})); // ストリーミングレスポンスの作成
		const stream = await this.openai.responses.create({
			model: "gpt-4o",
			input: openaiMessages,
			tools: openaiTools,
			stream: true,
		});

		let assistantMessage = "";

		// AgentNodeと同様にイベントタイプに基づいてストリームからチャンクを処理
		for await (const event of stream) {
			// テキストデルタイベント - テキストチャンクを処理
			if (event.type === "response.output_text.delta") {
				const delta = event.delta;
				assistantMessage += delta;
				onTextChunk(delta);
			}

			// 関数呼び出しイベント - この実装では関数呼び出しは処理しないが
			// イベントタイプの例として残しておく
			if (
				event.type === "response.output_item.done" &&
				event.item?.type === "function_call"
			) {
				// 現在の実装では関数呼び出しは扱わない
				console.log(
					"Function call detected but not handled in this implementation",
				);
			}
		}

		// 応答を会話履歴に追加
		if (assistantMessage) {
			this.messages.push({
				role: "assistant",
				content: assistantMessage,
			});
		}
	}
	/**
	 * 会話履歴をクリアします.
	 */
	clearConversation(): void {
		// システムプロンプトを保持する場合は最初のメッセージだけ残す
		const systemMessage = this.messages.find((msg) => msg.role === "system");
		this.messages = systemMessage ? [systemMessage] : [];
	}
}
