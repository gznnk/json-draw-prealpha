import type { TextAlign } from "../core/TextAlign";
import type { VerticalAlign } from "../core/VerticalAlign";

export type DiagramStyleChangeEvent = {
	eventId: string;
	id: string;
	cornerRadius?: number;
	stroke?: string;
	strokeWidth?: string;
	fill?: string;
	fontColor?: string;
	fontSize?: number;
	fontFamily?: string;
	fontWeight?: string;
	textAlign?: TextAlign;
	verticalAlign?: VerticalAlign;
};
