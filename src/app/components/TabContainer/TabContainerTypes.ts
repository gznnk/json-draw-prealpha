/**
 * Tab information structure with content
 */
export interface TabItem {
	/** Unique identifier for the tab */
	id: string;
	/** Display title for the tab */
	title: string;
	/** Content to be displayed inside the tab */
	content: React.ReactNode;
}

/**
 * Props for TabContainer component
 */
export interface TabContainerProps {
	/** Array of tab items containing tab info and content */
	tabs: TabItem[];
	/** ID of the currently active tab */
	activeTabId: string;
	/** Callback when a tab is selected */
	onTabSelect?: (tabId: string) => void;
}
