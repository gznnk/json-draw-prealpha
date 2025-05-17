// Import types related to SvgCanvas.
import type { RectangleData } from "../shapes/RectangleData";

/**
 * Type of the TextAreaNode data.
 */
export type TextAreaNodeData = Omit<RectangleData, "type"> & {
	type: "TextAreaNode";
	text?: string;
	isTextEditing?: boolean;
};
