import type { TextAlign } from "../base/TextAlign";
import type { VerticalAlign } from "../base/VerticalAlign";

export type DiagramStyleChangeEvent = {
	eventId: string;
	id: string;
	radius?: number;
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
