// Import types.
import type { TextAlign } from "../../../types/core/TextAlign";
import type { TextableType } from "../../../types/core/TextableType";
import type { VerticalAlign } from "../../../types/core/VerticalAlign";
import type { TextState } from "../../../types/state/shapes/TextState";

// Import constants.
import { TextDefaultState } from "../../../constants/state/shapes/TextDefaultState";

// Import utils.
import { newId } from "../../../utils/shapes/common/newId";

/**
 * Creates text state with the specified properties.
 *
 * @param params - Text parameters including position and text properties.
 * @returns The created text state object.
 */
export const createTextState = ({
	x,
	y,
	width = 200,
	height = 50,
	text = "Text",
	textType = "textarea",
	textAlign = "center",
	verticalAlign = "center",
	fontColor = "black",
	fontSize = 16,
	fontFamily = "Segoe UI",
	fontWeight = "normal",
}: {
	x: number;
	y: number;
	width?: number;
	height?: number;
	text?: string;
	textType?: TextableType;
	textAlign?: TextAlign;
	verticalAlign?: VerticalAlign;
	fontColor?: string;
	fontSize?: number;
	fontFamily?: string;
	fontWeight?: string;
}): TextState => {
	return {
		...TextDefaultState,
		id: newId(),
		x,
		y,
		width,
		height,
		text,
		textType,
		textAlign,
		verticalAlign,
		fontColor,
		fontSize,
		fontFamily,
		fontWeight,
	} as TextState;
};