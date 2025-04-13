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
	bgColor: string;
	fontSize: number;
	onMenuClick: (menuType: DiagramMenuType) => void;
	onBgColorChange: (bgColor: string) => void;
	onFontSizeChange: (fontSize: number) => void;
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
