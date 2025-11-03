import type { ArrowHeadType } from "../core/ArrowHeadType";
import type { PathType } from "../core/PathType";
import type { StrokeDashType } from "../core/StrokeDashType";
import type { TextAlign } from "../core/TextAlign";
import type { VerticalAlign } from "../core/VerticalAlign";

export type DiagramStyle = {
	cornerRadius?: number;
	stroke?: string;
	strokeWidth?: number;
	strokeDashType?: StrokeDashType;
	pathType?: PathType;
	startArrowHead?: ArrowHeadType;
	endArrowHead?: ArrowHeadType;
	fill?: string;
	fontColor?: string;
	fontSize?: number;
	fontFamily?: string;
	fontWeight?: string;
	textAlign?: TextAlign;
	verticalAlign?: VerticalAlign;
};

export type DiagramStyleChangeEvent = {
	eventId: string;
	id: string;
	data: DiagramStyle;
};
