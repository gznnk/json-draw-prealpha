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
	| "LineStyle"
	| "FontSize"
	| "Bold"
	| "FontColor"
	| "Alignment"
	| "KeepAspectRatio";

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
