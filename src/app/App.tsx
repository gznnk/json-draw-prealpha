// Import React.
import { useState, useEffect } from "react";
import type { ReactElement } from "react";

// Import features.
import { ChatUI } from "../features/llm-chat-ui";
import type { Message } from "../features/llm-chat-ui/types";
import { LLMClientFactory } from "../features/llm-client";
import type { LLMClient } from "../features/llm-client";

// Import components.
import { Page } from "./components/Page";
import { SplitView } from "./components/SplitView/SplitView";
import { MarkdownEditorSample } from "./components/MarkdownEditorSample";

// Import utils.
import { Profiler } from "../utils/Profiler";
import { OpenAiKeyManager } from "../utils/KeyManager";

// Import AI tools
import { workflowAgent } from "../features/svg-canvas/tools/workflow_agent";
import { newSheet } from "./tools/new_sheet";
import { createSandbox } from "./tools/sandbox";

declare global {
	interface Window {
		profiler: Profiler;
	}
}

if (!window.profiler) {
	window.profiler = new Profiler();
}

/**
 * 新しいシートを追加するためのイベントを発行します
 * @param id - シートのID
 * @param sheetName - シートの表示名
 * @param sheetType - シートのタイプ（canvas, sandboxなど）
 */
export const dispatchAddNewSheetEvent = ({
	id,
	sheetName,
	sheetType = "canvas", // Default to canvas if not specified
}: {
	id: string;
	sheetName: string;
	sheetType?: string;
}) => {
	const event = new CustomEvent("add_new_sheet", {
		detail: {
			id,
			sheetName,
			sheetType,
		},
	});
	window.dispatchEvent(event);
};

/**
 * Appコンポーネント
 * アプリケーションのメインレイアウトを定義します
 */
const App = (): ReactElement => {
	// 状態管理
	const [messages, setMessages] = useState<Message[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [apiKey, setApiKey] = useState<string | null>(null);
	const [llmClient, setLLMClient] = useState<LLMClient | null>(null);

	// Load OpenAI API key from KeyManager on component mount
	useEffect(() => {
		const savedApiKey = OpenAiKeyManager.loadKey();
		setApiKey(savedApiKey);
	}, []);

	// Initialize LLM client if API key provided
	useEffect(() => {
		if (apiKey) {
			// LLMClientFactoryを使用してクライアントを初期化
			const client = LLMClientFactory.createClient(apiKey, {
				tools: [
					workflowAgent.definition,
					newSheet.definition,
					createSandbox.definition,
				],
				functionHandlers: {
					workflow_agent: workflowAgent.handler,
					new_sheet: newSheet.handler,
					create_sandbox: createSandbox.handler,
				},
				systemPrompt:
					"You are a general-purpose assistant that outputs responses in Markdown format. " +
					"When including LaTeX expressions, do not use code blocks. " +
					"Instead, use inline LaTeX syntax like $...$ for inline math and $$...$$ for block math." +
					"When creating workflows, always create a new sheet first before creating the workflow itself. IMPORTANT TOOL SELECTION: When asked to create HTML content, interactive applications (like calculators, games, demos), you MUST use the create_sandbox tool, NOT workflow_agent. The create_sandbox tool is specifically designed for HTML/JavaScript applications with a complete document structure. If the user request contains keywords like 'アプリ', 'ゲーム', 'デモ', 'HTML', 'インタラクティブ', '計算機', 'アプリケーション', or any interactive content that would benefit from HTML rendering, you MUST use the create_sandbox tool. Use workflow_agent ONLY for workflow diagrams, not for web applications.",
			});
			setLLMClient(client);
		} else {
			setLLMClient(null);
		}
	}, [apiKey]);
	// チャットUIの設定
	const chatConfig = {
		height: "100%",
		width: "100%",
		messages: messages,
		isLoading: isLoading,
		onSendMessage: async (message: string) => {
			// ユーザーメッセージを追加
			const userMessage: Message = {
				role: "user",
				content: message,
				timestamp: new Date(),
			};
			setMessages((prevMessages) => [...prevMessages, userMessage]);

			// LLMClientが利用可能な場合はAPIリクエストを実行
			if (llmClient) {
				try {
					setIsLoading(true);

					// アシスタント応答のプレースホルダーを追加
					const assistantMessage: Message = {
						role: "assistant",
						content: "",
						timestamp: new Date(),
					};
					setMessages((prevMessages) => [...prevMessages, assistantMessage]);

					// LLMClientを使用してレスポンスをストリーミング
					await llmClient.chat({
						message: userMessage.content,
						onTextChunk: (textChunk: string) => {
							setMessages((prevMessages) => {
								const updated = [...prevMessages];
								const lastMessage = updated[updated.length - 1];
								// 最後のメッセージ（assistant）を更新
								updated[updated.length - 1] = {
									...lastMessage,
									content: lastMessage.content + textChunk,
								};
								return updated;
							});
						},
					});
				} catch (error) {
					console.error("Error calling LLM service:", error);
					// エラーメッセージを追加
					setMessages((prevMessages) => [
						...prevMessages,
						{
							role: "assistant",
							content:
								"申し訳ありませんが、応答の生成中にエラーが発生しました。もう一度お試しください。",
							timestamp: new Date(),
						},
					]);
				} finally {
					setIsLoading(false);
				}
			} else {
				// LLMClientが利用できない場合はエラーメッセージを表示
				setIsLoading(true);
				setTimeout(() => {
					const assistantMessage: Message = {
						role: "assistant",
						content:
							"APIキーが設定されていないため、応答を生成できません。APIキーを設定してください。",
						timestamp: new Date(),
					};
					setMessages((prevMessages) => [...prevMessages, assistantMessage]);
					setIsLoading(false);
				}, 500);
			}
		},
	};

	return (
		<div className="App">
			<Page>
				<SplitView
					initialRatio={0.67}
					left={
						// マークダウンエディターサンプルを表示
						<MarkdownEditorSample />
					}
					right={<ChatUI {...chatConfig} />}
				/>
			</Page>
		</div>
	);
};

export default App;
