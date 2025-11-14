// filepath: c:\Users\maver\Project\react-vite-project\src\features\llm-client\openai\client.ts
import OpenAI from "openai";

import type { LLMClient, ChatParams } from "../interface";
import type {
	ToolDefinition,
	FunctionHandlerMap,
	FunctionCallInfo,
	LLMClientOptions,
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
	private readonly maxAttempts: number;
	private messages: OpenAI.Responses.ResponseInput = [];
	/**
	 * OpenAIクライアントを初期化します.
	 *
	 * @param apiKey - OpenAI APIキー
	 * @param options - 初期化オプション
	 */
	constructor(apiKey: string, options?: LLMClientOptions) {
		this.openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
		this.tools = options?.tools;
		this.maxAttempts = options?.maxAttempts ?? 100;

		// 関数ハンドラが指定されていれば登録
		if (options?.functionHandlers) {
			this.functionHandlers = { ...options.functionHandlers };
		}

		// システムプロンプトが指定されていれば登録
		if (options?.systemPrompt) {
			this.systemPrompt = options.systemPrompt;
		}
		// 初期メッセージが指定されていれば復元
		if (options?.initialMessages) {
			this.messages = options.initialMessages as OpenAI.Responses.ResponseInput;
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
						const property: Record<string, unknown> = {
							type: param.type,
							description: param.description,
						};

						// enumが指定されている場合は追加
						if (param.enum) {
							property.enum = param.enum;
						}

						// itemsが指定されている場合は追加
						if (param.items) {
							const items: Record<string, unknown> = {
								type: param.items.type,
							};

							// itemsのtypeがobjectの場合、propertiesとadditionalPropertiesを設定
							if (param.items.type === "object" && param.items.properties) {
								items.properties = param.items.properties;
								// additionalPropertiesは常にfalse
								items.additionalProperties = false;
								// propertiesの全てのキーをrequiredに設定
								items.required = Object.keys(param.items.properties);
							}

							property.items = items;
						}

						acc[param.name] = property;
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

		// 関数コールを処理するためのループ（複数回の関数コールをサポート）
		for (let attempts = 0; attempts < this.maxAttempts; attempts++) {
			// ストリーミングレスポンスの作成
			const stream = await this.openai.responses.create({
				model: "gpt-5",
				instructions: this.systemPrompt,
				input: this.messages,
				tools: openaiTools,
				stream: true,
			});

			let foundFunctionCall = false;

			// 直近の reasoning アイテムを覚えておく
			let lastReasoningItem: OpenAI.Responses.ResponseOutputItem | null = null;

			// イベントタイプに基づいてストリームからチャンクを処理
			for await (const event of stream) {
				// テキストデルタイベント - テキストチャンクを処理
				if (event.type === "response.output_text.delta") {
					const delta = event.delta;
					assistantMessage += delta;
					onTextChunk(delta);
				}

				// reasoning を捕捉
				if (
					event.type === "response.output_item.done" &&
					event.item?.type === "reasoning"
				) {
					lastReasoningItem = event.item; // 次の function_call 用に保持
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

								// 関数コールの前に reasoning アイテムを追加
								if (lastReasoningItem) {
									this.messages.push(lastReasoningItem);
									lastReasoningItem = null; // リセット
								}

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
	/**
	 * 現在の会話履歴をOpenAI固有の形式で取得します.
	 * @returns OpenAI形式のメッセージのリスト
	 */
	getConversationHistory(): unknown[] {
		return this.messages;
	}
}
