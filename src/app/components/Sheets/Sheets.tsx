import { memo } from "react";
import type { FC } from "react";
import type { SheetsProps } from "./SheetsTypes";
import {
	SheetsWrapper,
	SheetContentContainer,
	SheetBar,
	SheetButton,
	AddSheetButton,
} from "./SheetsStyled";

/**
 * Sheets component that displays content in tabs at the bottom of the screen
 * similar to Excel spreadsheets.
 *
 * @param props - Component props including tabs info, content items, active tab ID, and event handlers
 * @returns Sheets component with Excel-like bottom tabs
 */
export const Sheets: FC<SheetsProps> = memo(
	({ tabs, contentItems, activeTabId, onTabSelect, onAddTab }) => {
		// Handle tab selection
		const handleTabClick = (tabId: string) => {
			if (onTabSelect) {
				onTabSelect(tabId);
			}
		};

		// Find the content for active tab
		const activeContent = contentItems.find(
			(item) => item.id === activeTabId,
		)?.content;

		return (
			<SheetsWrapper>
				{/* Content area - content is absolutely positioned inside this container */}
				<SheetContentContainer>
					{/* Render the content for active tab */}
					{activeContent}
				</SheetContentContainer>

				{/* Sheet bar at the bottom */}
				<SheetBar>
					{tabs.map((tab) => (
						<SheetButton
							key={tab.id}
							isActive={activeTabId === tab.id}
							onClick={() => handleTabClick(tab.id)}
						>
							{tab.title}
						</SheetButton>
					))}

					{/* Excel-like Add Sheet button */}
					{onAddTab && (
						<AddSheetButton
							onClick={onAddTab}
							aria-label="Add new sheet"
							title="Add new sheet"
						>
							+
						</AddSheetButton>
					)}
				</SheetBar>
			</SheetsWrapper>
		);
	},
);
