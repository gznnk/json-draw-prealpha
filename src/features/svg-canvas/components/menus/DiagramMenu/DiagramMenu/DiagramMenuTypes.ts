/**
 * Props for the DiagramMenu component.
 */
export type DiagramMenuProps = {
	x: number;
	y: number;
	width: number;
	height: number;
	rotation: number;
	scaleX: number;
	scaleY: number;
	isVisible: boolean;
	menuStateMap: DiagramMenuStateMap;
	onMenuClick: (menuType: DiagramMenuType) => void;
};

/**
 * Diagram menu types.
 */
export type DiagramMenuType =
	| "BgColor"
	| "BorderColor"
	| "FontSize"
	| "Bold"
	| "FontColor"
	| "AlignLeft"
	| "AlignCenter"
	| "AlignRight"
	| "AlignTop"
	| "AlignMiddle"
	| "AlignBottom"
	| "KeepAspectRatio"
	| "Group";

/**
 * Diagram menu state.
 */
export type DiagramMenuState = "Show" | "Active" | "Hidden";

/**
 * Diagram menu state map.
 */
export type DiagramMenuStateMap = {
	[key in DiagramMenuType]: DiagramMenuState;
};
