import type { ReactElement } from "react";
import { useCallback, useState } from "react";

import { CanvasView } from "./components/CanvasView";
import { Page } from "./components/Page";
import { SplitView } from "./components/SplitView";
import { CanvasDataProvider, useCanvasData } from "./context/CanvasDataContext";
import {
	ChatSpace,
	type ChatSpaceMessage,
	type ChatSpaceThread,
} from "../features/chat-space";

const ENABLE_CHAT_SPACE_EXPERIMENT = true;

const INITIAL_THREADS: ChatSpaceThread[] = [
	{
		id: "diagram-feedback",
		title: "Diagram feedback",
		description: "Reviewing the latest workflow layout",
		unreadCount: 0,
		lastActivityAt: "2025-01-12T10:26:00.000Z",
	},
	{
		id: "qa-sync",
		title: "QA sync",
		description: "Integration test updates and questions",
		unreadCount: 2,
		lastActivityAt: "2025-01-14T08:15:00.000Z",
	},
	{
		id: "handoff-notes",
		title: "Handoff notes",
		description: "Share context with implementation team",
		unreadCount: 0,
		lastActivityAt: "2025-01-09T17:40:00.000Z",
	},
];

const INITIAL_MESSAGES: ChatSpaceMessage[] = [
	{
		id: "message-1",
		threadId: "diagram-feedback",
		role: "assistant",
		authorName: "Canvas Copilot",
		content:
			"The updated connectors look much cleaner. Do we still need the dotted guideline?",
		timestamp: "2025-01-12T10:24:00.000Z",
	},
	{
		id: "message-2",
		threadId: "diagram-feedback",
		role: "user",
		authorName: "You",
		content: "I'll keep it for now—it helps highlight the shared data path.",
		timestamp: "2025-01-12T10:26:00.000Z",
	},
	{
		id: "message-3",
		threadId: "qa-sync",
		role: "assistant",
		authorName: "QA Bot",
		content:
			"Integration suite fails on the export node. Need expected payload shape after the refactor.",
		timestamp: "2025-01-14T08:03:00.000Z",
	},
	{
		id: "message-4",
		threadId: "qa-sync",
		role: "assistant",
		authorName: "QA Bot",
		content:
			"Also double-check whether the debounce on the API node is still required.",
		timestamp: "2025-01-14T08:10:00.000Z",
	},
	{
		id: "message-5",
		threadId: "handoff-notes",
		role: "assistant",
		authorName: "Release Assistant",
		content:
			"Summarize the diagram changes so the deployment team understands the new branching logic.",
		timestamp: "2025-01-09T17:35:00.000Z",
	},
	{
		id: "message-6",
		threadId: "handoff-notes",
		role: "user",
		authorName: "You",
		content: "Will do—I'll add the notes before stand-up.",
		timestamp: "2025-01-09T17:40:00.000Z",
	},
];

/**
 * Inner App component that uses canvas data context
 */
const AppContent = (): ReactElement => {
	const { canvas, updateCanvas } = useCanvasData();
	const [threads, setThreads] = useState<ChatSpaceThread[]>(() =>
		INITIAL_THREADS.map((thread) => ({ ...thread })),
	);
	const [messages, setMessages] = useState<ChatSpaceMessage[]>(() =>
		INITIAL_MESSAGES.map((message) => ({ ...message })),
	);
	const [activeThreadId, setActiveThreadId] = useState<string | undefined>(
		() => INITIAL_THREADS[0]?.id,
	);

	const handleThreadSelect = useCallback((threadId: string) => {
		setActiveThreadId(threadId);
		setThreads((prev) =>
			prev.map((thread) =>
				thread.id === threadId ? { ...thread, unreadCount: 0 } : thread,
			),
		);
	}, []);

	const handleSendMessage = useCallback(
		(threadId: string, content: string) => {
			const now = new Date();
			const nextMessage: ChatSpaceMessage = {
				id: `message-${now.getTime()}`,
				threadId,
				role: "user",
				authorName: "You",
				content,
				timestamp: now,
			};

			setMessages((prev) => [...prev, nextMessage]);
			setThreads((prev) =>
				prev.map((thread) =>
					thread.id === threadId
						? {
								...thread,
								unreadCount: 0,
								lastActivityAt: now,
								lastMessagePreview: content,
							}
						: thread,
				),
			);
			setActiveThreadId(threadId);
		},
		[],
	);

	const canvasPane = canvas?.content ? (
		<CanvasView content={canvas.content} onDataChange={updateCanvas} />
	) : (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				height: "100%",
				color: "#e5e7eb",
				fontSize: "14px",
				letterSpacing: "0.02em",
			}}
		>
			Loading canvas...
		</div>
	);

	if (!ENABLE_CHAT_SPACE_EXPERIMENT) {
		return <Page>{canvasPane}</Page>;
	}

	return (
		<Page>
			<SplitView
				initialRatio={[0.65, 0.35]}
				left={canvasPane}
				right={
					<ChatSpace
						threads={threads}
						messages={messages}
						initialThreadId={activeThreadId}
						width="100%"
						height="100%"
						onThreadSelect={handleThreadSelect}
						onSendMessage={handleSendMessage}
					/>
				}
			/>
		</Page>
	);
};

/**
 * App component
 * Defines the main application layout
 */
const App = (): ReactElement => {
	return (
		<div className="App">
			<CanvasDataProvider>
				<AppContent />
			</CanvasDataProvider>
		</div>
	);
};

export default App;
