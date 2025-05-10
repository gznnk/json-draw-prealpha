// Import React.
import { useState, useEffect, useMemo } from "react";

// Import features.
import { ChatUI } from "../features/llm-chat-ui";

// Import components.
import {
	Sheets,
	type SheetItem,
	type SheetContentItem,
} from "./components/Sheets";
import { CanvasSheet } from "./components/CanvasSheet";

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

const sheetItemsStr = localStorage.getItem("sheets") || "[]";
const sheetItems: SheetItem[] = JSON.parse(sheetItemsStr) || [];

const ADD_NEW_SHEET_EVENT_NAME = "add_new_sheet";
export const dispatchAddNewSheetEvent = ({
	id,
	sheetName,
}: {
	id: string;
	sheetName: string;
}) => {
	const event = new CustomEvent(ADD_NEW_SHEET_EVENT_NAME, {
		detail: {
			id,
			sheetName,
		},
	});
	window.dispatchEvent(event);
};

function App() {
	const [apiKey, setApiKey] = useState<string | null>(null);

	const [activeTabId, setActiveTabId] = useState<string>("default");

	// Load OpenAI API key from KeyManager on component mount
	useEffect(() => {
		const savedApiKey = OpenAiKeyManager.loadKey();
		setApiKey(savedApiKey);
	}, []);

	// タブ情報の管理
	const [tabs, setTabs] = useState<SheetItem[]>(sheetItems);

	/**
	 * Generate content items for the sheets component.
	 * This creates a new component instance for each tab to ensure proper state isolation.
	 * The key prop ensures React creates a new instance when tabs change.
	 */
	const contentItems: SheetContentItem[] = useMemo(
		() =>
			tabs.map((tab) => ({
				id: tab.id,
				content: <CanvasSheet key={tab.id} id={tab.id} />,
			})),
		[tabs],
	);

	/**
	 * Handles adding a new tab to the tab container.
	 * Generates a unique ID and title based on the current tab count.
	 */
	const handleAddTab = () => {
		const tabCount = tabs.length + 1;
		const newTabId = `tab-${Date.now()}`;
		const newTab: SheetItem = {
			id: newTabId,
			title: `Sheet ${tabCount}`,
		};

		setTabs([...tabs, newTab]);
		setActiveTabId(newTabId); // 新しいタブを自動的に選択

		localStorage.setItem("sheets", JSON.stringify([...tabs, newTab]));
	};

	// チャットUIの設定
	const chatConfig = {
		height: "100%",
		width: "100%",
		apiKey: apiKey,
		openAIConfig: {
			model: "gpt-4",
		},
	};

	useEffect(() => {
		const handleAddNewSheetEvent = (e: Event) => {
			const { id, sheetName } = (e as CustomEvent).detail;
			const newTab: SheetItem = {
				id,
				title: sheetName,
			};
			setTabs((prevTabs) => [...prevTabs, newTab]);
			setActiveTabId(id); // 新しいタブを自動的に選択
		};
		window.addEventListener(ADD_NEW_SHEET_EVENT_NAME, handleAddNewSheetEvent);

		return () => {
			window.removeEventListener(
				ADD_NEW_SHEET_EVENT_NAME,
				handleAddNewSheetEvent,
			);
		};
	}, []);

	return (
		<div className="App">
			<div
				style={{
					position: "fixed",
					top: 0,
					left: 0,
					right: "33.33%",
					bottom: 0,
					backgroundColor: "#0C0F1C",
				}}
			>
				{/* SVGキャンバスエリア (2/3) */}
				<div style={{ width: "100%", height: "100%" }}>
					<Sheets
						tabs={tabs}
						contentItems={contentItems}
						activeTabId={activeTabId}
						onTabSelect={setActiveTabId}
						onAddTab={handleAddTab}
					/>
				</div>
			</div>
			{/* チャットエリア (1/3) */}
			<div
				style={{
					position: "fixed",
					top: 0,
					left: "66.67%",
					right: 0,
					bottom: 0,
					borderLeft: "1px solid #3A415C",
					boxSizing: "border-box",
				}}
			>
				<ChatUI {...chatConfig} apiKey={apiKey || undefined} />
			</div>
		</div>
	);
}

export default App;
