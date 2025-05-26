// filepath: c:\Users\maver\Project\react-vite-project\src\features\llm-client\openai\client.ts
import OpenAI from "openai";
import type { LLMClient, ChatParams } from "../interface";
import type {
	ToolDefinition,
	FunctionHandlerMap,
	FunctionCallInfo,
} from "../types";

/**
 * OpenAIを使用したLLMクライアントの実装.
 * 会話履歴を内部で管理し、APIとの通信を行います.
 */
export class OpenAIClient implements LLMClient {
	private readonly openai: OpenAI;
	private readonly systemPrompt?: string;
	private readonly tools?: ToolDefinition[];
	private readonly functionHandlers: FunctionHandlerMap = {};
	private messages: OpenAI.Responses.ResponseInput = [];

	/**
	 * OpenAIクライアントを初期化します.
	 *
	 * @param apiKey - OpenAI APIキー
	 * @param options - 初期化オプション
	 * @param options.tools - 利用可能なツール定義のリスト
	 * @param options.systemPrompt - システムプロンプト
	 * @param options.functionHandlers - 関数名とハンドラのマッピング
	 */
	constructor(
		apiKey: string,
		options?: {
			tools?: ToolDefinition[];
			systemPrompt?: string;
			functionHandlers?: FunctionHandlerMap;
		},
	) {
		this.openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
		this.tools = options?.tools;

		// 関数ハンドラが指定されていれば登録
		if (options?.functionHandlers) {
			this.functionHandlers = { ...options.functionHandlers };
		}

		// システムプロンプトが指定されていれば登録
		if (options?.systemPrompt) {
			this.systemPrompt = options.systemPrompt;
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
							type: param.type,
							description: param.description,
						};
						return acc;
					},
					{} as Record<string, unknown>,
				),
				additionalProperties: false,
				required: tool.parameters.reduce((acc, param) => {
					acc.push(param.name);
					return acc;
				}, [] as string[]),
			},
			strict: true,
		})) as OpenAI.Responses.Tool[];

		let assistantMessage = "";
		const maxAttempts = 10; // 最大ループ回数を制限

		// 関数コールを処理するためのループ（複数回の関数コールをサポート）
		for (let attempts = 0; attempts < maxAttempts; attempts++) {
			// ストリーミングレスポンスの作成
			const stream = await this.openai.responses.create({
				model: "gpt-4o",
				instructions: this.systemPrompt,
				input: this.messages,
				tools: openaiTools,
				stream: true,
			});

			let foundFunctionCall = false;

			// イベントタイプに基づいてストリームからチャンクを処理
			for await (const event of stream) {
				// テキストデルタイベント - テキストチャンクを処理
				if (event.type === "response.output_text.delta") {
					const delta = event.delta;
					assistantMessage += delta;
					onTextChunk(delta);
				}

				// 関数呼び出しイベント - 関数ハンドラマップを使って処理
				if (
					event.type === "response.output_item.done" &&
					event.item?.type === "function_call"
				) {
					foundFunctionCall = true;

					const functionCall: FunctionCallInfo = {
						name: event.item.name,
						arguments: JSON.parse(event.item.arguments),
						callId: event.item.call_id,
					};

					const handler = this.functionHandlers[functionCall.name];

					if (handler) {
						try {
							// 登録されているハンドラで関数コールを処理
							const result = await handler(functionCall);

							if (result !== null) {
								// 関数コール情報をコンソールに出力
								console.log(`Function called: ${functionCall.name}`);

								// 関数呼び出しメッセージ
								this.messages.push(event.item);

								// 関数の結果メッセージ（OpenAI APIは特殊な形式を要求）
								this.messages.push({
									type: "function_call_output",
									call_id: event.item.call_id,
									output: JSON.stringify(result),
								});
							}
						} catch (error) {
							console.error(
								`Error handling function call ${functionCall.name}:`,
								error,
							);

							// 関数呼び出しメッセージ
							this.messages.push(event.item);

							// エラーメッセージを会話履歴に追加
							this.messages.push({
								type: "function_call_output",
								call_id: event.item.call_id,
								output: JSON.stringify({ error: "Function execution failed" }),
							});
						}
					} else {
						console.warn(
							`No handler registered for function: ${functionCall.name}`,
						);
					}
				}
			}

			// 関数コールがなければループを終了
			if (!foundFunctionCall) {
				break;
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
		const systemMessage = this.messages.find(
			(msg) => "role" in msg && msg.role === "system",
		);
		this.messages = systemMessage ? [systemMessage] : [];
	}
}
