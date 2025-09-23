import type { SvgCanvasProps } from "../../../../canvas/types/SvgCanvasProps";

/**
 * Props for the DiagramMenu component.
 */
export type DiagramMenuProps = {
	canvasProps: SvgCanvasProps;
	containerWidth: number;
	containerHeight: number;
};

/**
 * Diagram menu types.
 */
export type DiagramMenuType =
	| "BgColor"
	| "BorderColor"
	| "BorderRadius"
	| "FontSize"
	| "Bold"
	| "FontColor"
	| "AlignLeft"
	| "AlignCenter"
	| "AlignRight"
	| "AlignTop"
	| "AlignMiddle"
	| "AlignBottom"
	| "BringToFront"
	| "BringForward"
	| "SendBackward"
	| "SendToBack"
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
