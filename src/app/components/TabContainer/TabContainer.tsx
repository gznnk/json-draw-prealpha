import { memo } from "react";
import type { FC } from "react";
import type { TabContainerProps } from "./TabContainerTypes";
import {
	TabContainerWrapper,
	TabContentContainer,
	TabBar,
	TabButton,
	AddTabButton,
} from "./TabContainerStyled";

/**
 * TabContainer component that displays content in tabs at the bottom of the screen
 * similar to Excel spreadsheets.
 *
 * Features:
 * - Shows tabs at the bottom of the container
 * - Only renders content of the active tab
 * - Supports absolute positioning for tab content
 * - Allows switching between tabs by clicking on tab buttons
 * - Includes an "Add Tab" button at the end of the tab bar (Excel-like)
 *
 * @example
 * ```tsx
 * import { useState } from "react";
 * import { TabContainer, TabItem } from "../app/components/Tab";
 *
 * const ExamplePage = () => {
 *   const [activeTabId, setActiveTabId] = useState<string>("dashboard");
 *
 *   // Define tabs with their content
 *   const tabs: TabItem[] = [
 *     {
 *       id: "dashboard",
 *       title: "Dashboard",
 *       content: <div style={{ position: "absolute", top: 0, left: 0 }}>Dashboard Content</div>
 *     },
 *     {
 *       id: "analytics",
 *       title: "Analytics",
 *       content: <div style={{ position: "absolute", top: 0, left: 0 }}>Analytics Content</div>
 *     },
 *     {
 *       id: "settings",
 *       title: "Settings",
 *       content: <div style={{ position: "absolute", top: 0, left: 0 }}>Settings Content</div>
 *     },
 *   ];
 *
 *   // Handle adding a new tab
 *   const handleAddTab = () => {
 *     // Logic to add a new tab
 *   };
 *
 *   return (
 *     <div style={{ width: "100%", height: "500px" }}>
 *       <TabContainer
 *         tabs={tabs}
 *         activeTabId={activeTabId}
 *         onTabSelect={setActiveTabId}
 *         onAddTab={handleAddTab}
 *       />
 *     </div>
 *   );
 * };
 * ```
 *
 * @param props - Component props including tabs with content, active tab ID, and tab selection handler
 * @returns Tab container component with Excel-like bottom tabs
 */
export const TabContainer: FC<TabContainerProps> = memo(
	({ tabs, activeTabId, onTabSelect, onAddTab }) => {
		// Handle tab selection
		const handleTabClick = (tabId: string) => {
			if (onTabSelect) {
				onTabSelect(tabId);
			}
		};

		// Find the active tab
		const activeTab = tabs.find((tab) => tab.id === activeTabId);

		return (
			<TabContainerWrapper>
				{/* Content area - content is absolutely positioned inside this container */}
				<TabContentContainer>
					{/* Only render the active tab content */}
					{activeTab?.content}
				</TabContentContainer>

				{/* Tab bar at the bottom */}
				<TabBar>
					{tabs.map((tab) => (
						<TabButton
							key={tab.id}
							isActive={activeTabId === tab.id}
							onClick={() => handleTabClick(tab.id)}
						>
							{tab.title}
						</TabButton>
					))}

					{/* Excel-like Add Tab button */}
					{onAddTab && (
						<AddTabButton
							onClick={onAddTab}
							aria-label="Add new tab"
							title="Add new tab"
						>
							+
						</AddTabButton>
					)}
				</TabBar>
			</TabContainerWrapper>
		);
	},
);
