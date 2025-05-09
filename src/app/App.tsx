import {
	SvgCanvas,
	useSvgCanvas,
	type SvgCanvasRef,
} from "../features/svg-canvas";
import { ChatUI } from "../features/llm-chat-ui";
import type { Diagram } from "../features/svg-canvas/types/DiagramCatalog";
import { createRectangleData } from "../features/svg-canvas/components/shapes/Rectangle";
import { createEllipseData } from "../features/svg-canvas/components/shapes/Ellipse";

import { Profiler } from "../utils/Profiler";
import { OpenAiKeyManager } from "../utils/KeyManager";

import { loadCanvasDataFromLocalStorage } from "../features/svg-canvas/canvas/SvgCanvasFunctions";
import { useRef, useState, useEffect } from "react";
import { TabContainer, type TabItem } from "./components/TabContainer";

declare global {
	interface Window {
		profiler: Profiler;
	}
}

if (!window.profiler) {
	window.profiler = new Profiler();
}

const testItems1 = [
	createRectangleData({
		x: 100,
		y: 100,
	}),
	createEllipseData({
		x: 100,
		y: 100,
	}),
	{
		id: "g-1",
		type: "Group",
		x: 350,
		y: 350,
		width: 400,
		height: 400,
		rotation: 0,
		scaleX: 1,
		scaleY: 1,
		keepProportion: true,
		isSelected: false,
		isMultiSelectSource: false,
		items: [
			createRectangleData({
				x: 200,
				y: 200,
			}),
			createEllipseData({
				x: 300,
				y: 200,
			}),
			createRectangleData({
				x: 300,
				y: 300,
			}),
			createEllipseData({
				x: 200,
				y: 300,
			}),
			{
				id: "g-2",
				type: "Group",
				x: 450,
				y: 450,
				width: 200,
				height: 200,
				rotation: 0,
				scaleX: 1,
				scaleY: 1,
				fill: "transparent",
				stroke: "black",
				strokeWidth: "1px",
				keepProportion: true,
				isSelected: false,
				isMultiSelectSource: false,
				items: [
					createRectangleData({
						x: 400,
						y: 400,
					}),
					createEllipseData({
						x: 500,
						y: 400,
					}),
					createRectangleData({
						x: 500,
						y: 500,
					}),
				],
			},
			{
				id: "g-3",
				type: "Group",
				x: 450,
				y: 250,
				width: 200,
				height: 200,
				rotation: 0,
				scaleX: 1,
				scaleY: 1,
				fill: "transparent",
				stroke: "black",
				strokeWidth: "1px",
				keepProportion: true,
				isSelected: false,
				isMultiSelectSource: false,
				items: [
					createRectangleData({
						x: 400,
						y: 200,
					}),
					createRectangleData({
						x: 500,
						y: 300,
					}),
				],
			},
		],
	},
	{
		id: "12",
		type: "Path",
		x: 100,
		y: 150,
		width: 200,
		height: 100,
		rotation: 0,
		scaleX: 1,
		scaleY: 1,
		stroke: "black",
		strokeWidth: "1px",
		keepProportion: false,
		isSelected: false,
		isMultiSelectSource: false,
		items: [
			{
				id: "12-1",
				type: "PathPoint",
				x: 0,
				y: 100,
				width: 0,
				height: 0,
				keepProportion: false,
				isSelected: false,
				isMultiSelectSource: false,
			},
			{
				id: "12-2",
				type: "PathPoint",
				x: 100,
				y: 100,
				width: 0,
				height: 0,
				keepProportion: false,
				isSelected: false,
				isMultiSelectSource: false,
			},
			{
				id: "12-3",
				type: "PathPoint",
				x: 200,
				y: 200,
				width: 0,
				height: 0,
				keepProportion: false,
				isSelected: false,
				isMultiSelectSource: false,
			},
		],
	},
] as Diagram[];

const testItems2 = [
	{
		id: "12",
		type: "Path",
		x: 0,
		y: 100,
		width: 100,
		height: 100,
		stroke: "black",
		strokeWidth: "1px",
		keepProportion: false,
		isSelected: false,
		items: [
			{
				id: "12-1",
				type: "PathPoint",
				x: 0,
				y: 100,
				width: 0,
				height: 0,
				keepProportion: false,
				isSelected: false,
			},
			{
				id: "12-2",
				type: "PathPoint",
				x: 100,
				y: 100,
				width: 0,
				height: 0,
				keepProportion: false,
				isSelected: false,
			},
			{
				id: "12-3",
				type: "PathPoint",
				x: 200,
				y: 200,
				width: 0,
				height: 0,
				keepProportion: false,
				isSelected: false,
			},
		],
	},
] as Diagram[];

const testItems3 = [
	{
		id: "g-1",
		type: "Group",
		x: 250,
		y: 250,
		width: 300,
		height: 300,
		rotation: 0,
		scaleX: 1,
		scaleY: 1,
		keepProportion: true,
		isSelected: false,
		isMultiSelectSource: false,
		items: [
			{
				id: "3",
				type: "Rectangle",
				x: 150,
				y: 150,
				width: 100,
				height: 100,
				rotation: 0,
				scaleX: 1,
				scaleY: 1,
				fill: "transparent",
				stroke: "black",
				strokeWidth: "1px",
				keepProportion: false,
				isSelected: false,
				isMultiSelectSource: false,
			},
			createEllipseData({
				x: 250,
				y: 150,
			}),
			{
				id: "5",
				type: "Rectangle",
				x: 250,
				y: 250,
				width: 100,
				height: 100,
				rotation: 0,
				scaleX: 1,
				scaleY: 1,
				fill: "transparent",
				stroke: "black",
				strokeWidth: "1px",
				keepProportion: false,
				isSelected: false,
				isMultiSelectSource: false,
			},
			{
				id: "12",
				type: "Path",
				x: 350,
				y: 350,
				width: 100,
				height: 100,
				rotation: 0,
				scaleX: 1,
				scaleY: 1,
				stroke: "black",
				strokeWidth: "1px",
				keepProportion: false,
				isSelected: false,
				isMultiSelectSource: false,
				items: [
					{
						id: "12-1",
						type: "PathPoint",
						x: 300,
						y: 300,
						width: 0,
						height: 0,
						keepProportion: false,
						isSelected: false,
					},
					{
						id: "12-2",
						type: "PathPoint",
						x: 320,
						y: 340,
						width: 0,
						height: 0,
						keepProportion: false,
						isSelected: false,
					},
					{
						id: "12-3",
						type: "PathPoint",
						x: 400,
						y: 400,
						width: 0,
						height: 0,
						keepProportion: false,
						isSelected: false,
					},
				],
			},
		],
	},
] as Diagram[];

const testItems4 = [
	createRectangleData({
		x: 300,
		y: 300,
	}),
	createRectangleData({
		x: 500,
		y: 300,
	}),
	createRectangleData({
		x: 700,
		y: 300,
	}),
	createRectangleData({
		x: 300,
		y: 500,
	}),
	createRectangleData({
		x: 500,
		y: 500,
	}),
	createRectangleData({
		x: 700,
		y: 500,
	}),
	createRectangleData({
		x: 300,
		y: 700,
	}),
	createRectangleData({
		x: 500,
		y: 700,
	}),
	createRectangleData({
		x: 700,
		y: 700,
	}),
] as Diagram[];

const testItems5 = [
	{
		id: "g-1",
		type: "Group",
		x: 200,
		y: 200,
		width: 200,
		height: 200,
		rotation: 0,
		scaleX: 1,
		scaleY: 1,
		keepProportion: true,
		isSelected: false,
		items: [
			createRectangleData({
				x: 150,
				y: 150,
			}),
			createEllipseData({
				x: 150,
				y: 250,
			}),
			createRectangleData({
				x: 250,
				y: 250,
			}),
		],
	},
	createRectangleData({
		x: 300,
		y: 500,
	}),
	createRectangleData({
		x: 500,
		y: 500,
	}),
] as Diagram[];

const testItems6 = [
	{
		id: "12",
		type: "Path",
		x: 350,
		y: 350,
		width: 100,
		height: 100,
		rotation: 0,
		scaleX: 1,
		scaleY: 1,
		stroke: "black",
		strokeWidth: "1px",
		keepProportion: false,
		isSelected: false,
		isMultiSelectSource: false,
		items: [
			{
				id: "12-1",
				type: "PathPoint",
				x: 300,
				y: 300,
				width: 0,
				height: 0,
				keepProportion: false,
				isSelected: false,
			},
			{
				id: "12-2",
				type: "PathPoint",
				x: 320,
				y: 340,
				width: 0,
				height: 0,
				keepProportion: false,
				isSelected: false,
			},
			{
				id: "12-3",
				type: "PathPoint",
				x: 400,
				y: 400,
				width: 0,
				height: 0,
				keepProportion: false,
				isSelected: false,
			},
		],
	},
] as Diagram[];

const devData = {
	item1: testItems1,
	item2: testItems2,
	item3: testItems3,
	item4: testItems4,
	item5: testItems5,
	item6: testItems6,
};

function App() {
	const loadedCanvasState = loadCanvasDataFromLocalStorage();
	const [apiKey, setApiKey] = useState<string | null>(null);

	const [activeTabId, setActiveTabId] = useState<string>("dashboard");

	// Load OpenAI API key from KeyManager on component mount
	useEffect(() => {
		const savedApiKey = OpenAiKeyManager.loadKey();
		setApiKey(savedApiKey);
	}, []);

	const canvasRef = useRef<SvgCanvasRef | null>(null);

	const canvasInitialState = {
		minX: 0,
		minY: 0,
		width: window.screen.width,
		height: window.screen.height,
		items: devData.item4,
		scrollLeft: 0,
		scrollTop: 0,
		canvasRef,
	};

	if (loadedCanvasState) {
		canvasInitialState.minX = loadedCanvasState.minX;
		canvasInitialState.minY = loadedCanvasState.minY;
		canvasInitialState.width = loadedCanvasState.width;
		canvasInitialState.height = loadedCanvasState.height;
		canvasInitialState.items = loadedCanvasState.items;
		canvasInitialState.scrollLeft = loadedCanvasState.scrollLeft;
		canvasInitialState.scrollTop = loadedCanvasState.scrollTop;
	}

	const { canvasProps } = useSvgCanvas(canvasInitialState);

	const [tabs, setTabs] = useState<TabItem[]>([
		{
			id: "dashboard",
			title: "Dashboard",
			content: <SvgCanvas {...canvasProps} ref={canvasRef} />,
		},
		{
			id: "analytics",
			title: "Analytics",
			content: (
				<div style={{ position: "absolute", top: 0, left: 0 }}>
					Analytics Content
				</div>
			),
		},
		{
			id: "settings",
			title: "Settings",
			content: (
				<div style={{ position: "absolute", top: 0, left: 0 }}>
					Settings Content
				</div>
			),
		},
	]);

	// チャットUIの設定
	const chatConfig = {
		height: "100%",
		width: "100%",
		apiKey: apiKey,
		openAIConfig: {
			model: "gpt-4",
		},
	};

	/**
	 * Handles adding a new tab to the tab container.
	 * Generates a unique ID and title based on the current tab count.
	 */
	const handleAddTab = () => {
		const tabCount = tabs.length + 1;
		const newTabId = `tab-${Date.now()}`;
		const newTab: TabItem = {
			id: newTabId,
			title: `Sheet ${tabCount}`,
			content: (
				<div style={{ position: "absolute", top: 0, left: 0 }}>
					Content for new sheet {tabCount}
				</div>
			),
		};

		setTabs([...tabs, newTab]);
		setActiveTabId(newTabId); // 新しいタブを自動的に選択
	};

	return (
		<div className="App">
			<div
				style={{
					position: "fixed",
					top: 0,
					left: 0,
					right: "33.33%",
					bottom: 0,
					backgroundColor: "#eeeeee",
				}}
			>
				{/* SVGキャンバスエリア (2/3) */}
				<div style={{ width: "100%", height: "100%" }}>
					<TabContainer
						tabs={tabs}
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
					borderLeft: "1px solid #ccc",
					boxSizing: "border-box",
				}}
			>
				<ChatUI {...chatConfig} apiKey={apiKey || undefined} />
			</div>
		</div>
	);
}

export default App;
