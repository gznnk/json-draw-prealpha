// Import React.
import { useState, useEffect, useCallback } from "react";
import type { ReactElement } from "react";

// Import features.
import { ChatUI } from "../features/llm-chat-ui";
import type { Message } from "../features/llm-chat-ui/types";
import { LLMClientFactory } from "../shared/llm-client";
import type { LLMClient } from "../shared/llm-client";

// Import components.
import { Page } from "./components/Page";
import { SplitView } from "./components/SplitView/SplitView";
import { DirectoryExplorer } from "../features/directory-explorer";
import type { DirectoryItem } from "../features/directory-explorer";
import { ContentContainer } from "./components/ContentContainer";
import { ContentType } from "./types/ContentType";

// Import utils.
import { Profiler } from "../utils/Profiler";
import { OpenAiKeyManager } from "../utils/KeyManager";

// Import AI tools.
import { workflowAgent } from "../features/svg-canvas/tools/workflow_agent";
import { newSheet } from "./tools/new_sheet";
import { createSandbox } from "./tools/sandbox";
import { newWork } from "./tools/new_work";

// Import repository and hooks.
import { useWorks } from "./hooks/useWorks";
import { useMarkdowns } from "./hooks/useMarkdowns";
import type { WorkingItem } from "./model/WorkingItem";
import type { Markdown } from "./model/Markdown";

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
	const { works, updateWorks, addWork } = useWorks();
	const { getMarkdownById, saveMarkdown } = useMarkdowns();
	const [workingItems, setWorkingItems] = useState<WorkingItem[]>([]);
	const [selectedItem, setSelectedItem] = useState<string | undefined>(
		undefined,
	);
	// new_workイベントのハンドリングとEventBusの取得
	const workEventBus = newWork.useTool(async (work) => {
		try {
			await addWork(work);
			setWorkingItems((prevItems) => [
				...prevItems,
				{
					id: work.id,
					content: "",
					isEditing: false,
				},
			]);
			setSelectedItem(work.id);
		} catch (error) {
			console.error("Failed to add new work:", error);
		}
	});

	// ドラッグ＆ドロップによるアイテム変更のハンドラ
	const handleDirectoryItemsChange = useCallback(
		(newItems: DirectoryItem[]) => {
			// DirectoryItemの配列をWorkの配列にマッピング
			const updatedWorks = newItems.map((item) => {
				return {
					id: item.id,
					name: item.name,
					path: item.path,
					type: item.isDirectory ? "group" : item.type || "document",
				};
			});

			// 状態とストレージを更新
			updateWorks(updatedWorks);
		},
		[updateWorks],
	);

	// フォルダを作成する処理
	const handleCreateFolder = useCallback(
		async (parentId: string, folderName: string) => {
			try {
				// 親フォルダの情報を取得
				const parentItem = works.find((work) => work.id === parentId);
				const parentPath = parentItem ? parentItem.path : "";

				// 新しいフォルダのパスと一意のIDを生成
				const folderPath = parentPath
					? `${parentPath}/${folderName}`
					: folderName;
				const folderId = `folder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

				// 新しいワーク(フォルダ)を作成
				const newFolder = {
					id: folderId,
					name: folderName,
					path: folderPath,
					type: "group",
				};

				// ワーク配列に追加
				await addWork(newFolder);
			} catch (error) {
				console.error("Failed to create folder:", error);
			}
		},
		[works, addWork],
	);

	// ファイルを作成する処理
	const handleCreateFile = useCallback(
		async (parentId: string, fileName: string) => {
			try {
				// 親フォルダの情報を取得
				const parentItem = works.find((work) => work.id === parentId);
				const parentPath = parentItem ? parentItem.path : "";

				// 新しいファイルのパスと一意のIDを生成
				const filePath = parentPath ? `${parentPath}/${fileName}` : fileName;
				const fileId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

				// 新しいワーク(ファイル)を作成
				const newFile = {
					id: fileId,
					name: fileName,
					path: filePath,
					type: "document",
				};

				// ワーク配列に追加
				await addWork(newFile); // 作業アイテムとして追加
				const newWorkingItem: WorkingItem = {
					id: fileId,
					content: "",
					isEditing: false,
				};
				setWorkingItems((prev) => [...prev, newWorkingItem]);

				// 作成したファイルを選択
				setSelectedItem(fileId);
			} catch (error) {
				console.error("Failed to create file:", error);
			}
		},
		[works, addWork],
	);

	// ファイルまたはフォルダを削除する処理
	const handleDelete = useCallback(
		async (itemId: string) => {
			try {
				// 削除対象のアイテムとその子孫を特定
				const itemToDelete = works.find((work) => work.id === itemId);
				if (!itemToDelete) return;

				// アイテムのパスで始まるすべてのアイテムも削除対象に（子孫）
				const itemsToDelete = works.filter(
					(work) =>
						work.id === itemId || work.path.startsWith(`${itemToDelete.path}/`),
				);
				const idsToDelete = itemsToDelete.map((item) => item.id);

				// 削除対象外のアイテムだけを残す
				const updatedWorks = works.filter(
					(work) => !idsToDelete.includes(work.id),
				);

				// ワーク配列を更新
				await updateWorks(updatedWorks);

				// 選択中のアイテムが削除対象の場合、選択を解除
				if (selectedItem && idsToDelete.includes(selectedItem)) {
					setSelectedItem(undefined);
				}

				// 関連するワーキングアイテムも削除
				setWorkingItems((prev) =>
					prev.filter((item) => !idsToDelete.includes(item.id)),
				);
			} catch (error) {
				console.error("Failed to delete item:", error);
			}
		},
		[works, updateWorks, selectedItem],
	);

	const handleDirectoryItemSelect = useCallback(
		async (itemId: string) => {
			// itemIdからワークを検索
			const item = works.find((work) => work.id === itemId);
			if (!item) return;

			// 既存の作業アイテムを探す
			const workingItem = workingItems.find((item) => item.id === itemId);

			if (!workingItem && item.type !== "group") {
				try {
					// 保存済みのマークダウンデータがあるか確認
					const savedMarkdown = await getMarkdownById(itemId);
					const content = savedMarkdown ? savedMarkdown.content : "";

					// 新しいワーキングアイテムを作成
					const newItem: WorkingItem = {
						id: itemId,
						content,
						isEditing: false,
					};
					setWorkingItems((prevItems) => [...prevItems, newItem]);
				} catch (error) {
					console.error(`Failed to load markdown for item ${itemId}:`, error);

					// エラー時は空のコンテンツで作成
					const newItem: WorkingItem = {
						id: itemId,
						content: "",
						isEditing: false,
					};
					setWorkingItems((prevItems) => [...prevItems, newItem]);
				}
			}

			setSelectedItem(itemId);
		},
		[workingItems, works, getMarkdownById],
	);

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
					newWork.definition,
				],
				functionHandlers: {
					workflow_agent: workflowAgent.handler,
					new_sheet: newSheet.handler,
					create_sandbox: createSandbox.handler,
					new_work: newWork.createHandler(workEventBus),
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
	}, [apiKey, workEventBus]);

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
							setWorkingItems((prevItems) =>
								prevItems.map((item) =>
									item.id === selectedItem
										? { ...item, content: item.content + textChunk }
										: item,
								),
							);
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
	const content =
		typeof workingItems.find((item) => item.id === selectedItem)?.content ===
		"string"
			? (workingItems.find((item) => item.id === selectedItem)
					?.content as string)
			: undefined;

	/**
	 * 保存ボタンがクリックされた時のハンドラ
	 */
	const handleSave = useCallback(async () => {
		// 選択されているアイテムが存在する場合のみ処理を実行
		if (selectedItem) {
			try {
				console.log(`Saving content for item with ID: ${selectedItem}`);

				// 選択中のアイテムの内容を取得
				const selectedWorkingItem = workingItems.find(
					(item) => item.id === selectedItem,
				);
				if (!selectedWorkingItem) return;

				// 対応するWorkを取得
				const work = works.find((work) => work.id === selectedItem);
				if (!work) return;

				// マークダウンオブジェクトを作成
				const markdownToSave: Markdown = {
					id: selectedItem,
					name: work.name,
					content: selectedWorkingItem.content || "",
				};

				// マークダウンを保存
				await saveMarkdown(markdownToSave);
				console.log(
					`Content saved successfully for item with ID: ${selectedItem}`,
				);

				// 編集フラグをリセット
				setWorkingItems((prev) =>
					prev.map((item) =>
						item.id === selectedItem ? { ...item, isEditing: false } : item,
					),
				);
			} catch (error) {
				console.error("Failed to save markdown content:", error);
			}
		}
	}, [selectedItem, workingItems, works, saveMarkdown]);

	return (
		<div className="App">
			<Page onSave={selectedItem ? handleSave : undefined}>
				<SplitView
					initialRatio={[0.2, 0.6, 0.2]}
					left={
						<DirectoryExplorer
							items={works.map((work) => ({
								id: work.id,
								name: work.name,
								path: work.path,
								isDirectory: work.type === "group",
								type: work.type,
								isEditing: workingItems.some(
									(item) => item.id === work.id && item.isEditing,
								),
							}))}
							selectedNodeId={selectedItem}
							onSelect={handleDirectoryItemSelect}
							onItemsChange={handleDirectoryItemsChange}
							onCreateFolder={handleCreateFolder}
							onCreateFile={handleCreateFile}
							onDelete={handleDelete}
						/>
					}
					center={
						// ContentContainerを表示（中央ペイン）
						<ContentContainer
							type={selectedItem ? ContentType.MARKDOWN : undefined}
							content={content}
							id={selectedItem}
							onChange={(newContent: string) => {
								setWorkingItems((prevItems) =>
									prevItems.map((item) =>
										item.id === selectedItem
											? { ...item, content: newContent, isEditing: true }
											: item,
									),
								);
							}}
						/>
					}
					right={
						// チャットUIを表示（右ペイン）
						<ChatUI {...chatConfig} />
					}
				/>
			</Page>
		</div>
	);
};

export default App;
