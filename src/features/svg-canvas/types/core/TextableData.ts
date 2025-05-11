// Import base types.
import type { TextableType, TextAlign, VerticalAlign } from "../base";

/**
 * Interface for diagram elements that can display and edit text.
 * Provides properties to control text content, appearance, and editing state.
 */
export type TextableData = {
	text: string;
	textType: TextableType;
	textAlign: TextAlign;
	verticalAlign: VerticalAlign;
	fontColor: string;
	fontSize: number;
	fontFamily: string;
	fontWeight: string;
	isTextEditing: boolean; // Non-persistent property. TODO: Separate persistent and non-persistent properties
};
