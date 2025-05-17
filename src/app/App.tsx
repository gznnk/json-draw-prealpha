// Import React.
import { useState, useEffect } from "react";
import type { ReactElement } from "react";

// Import features.
import { ChatUI } from "../features/llm-chat-ui";

// Import components.
import { Page } from "./components/Page";
import { SplitView } from "./components/SplitView/SplitView";
import { MarkdownEditorSample } from "./components/MarkdownEditorSample";

// Import utils.
import { Profiler } from "../utils/Profiler";
import { OpenAiKeyManager } from "../utils/KeyManager";

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
	const [apiKey, setApiKey] = useState<string | null>(null);

	// Load OpenAI API key from KeyManager on component mount
	useEffect(() => {
		const savedApiKey = OpenAiKeyManager.loadKey();
		setApiKey(savedApiKey);
	}, []);

	// チャットUIの設定
	const chatConfig = {
		height: "100%",
		width: "100%",
		apiKey: apiKey,
		openAIConfig: {
			model: "gpt-4",
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
					right={<ChatUI {...chatConfig} apiKey={apiKey || undefined} />}
				/>
			</Page>
		</div>
	);
};

export default App;
