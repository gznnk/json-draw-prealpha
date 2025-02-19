export type Point = {
	x: number;
	y: number;
};

export type Item = {
	id: string;
	type: string;
	point: Point;
	width: number;
	height: number;
	fill: string;
	stroke: string;
	strokeWidth: string;
	keepProportion: boolean;
	isSelected: boolean;
};

export enum DragDirection {
	All = 0,
	Horizontal = 1,
	Vertical = 2,
}

export type PointerDownEvent = {
	id?: string;
	point: Point;
	reactEvent?: React.PointerEvent<SVGElement>;
};

export type DragEvent = {
	id?: string;
	point: Point;
	reactEvent?: React.PointerEvent<SVGElement>;
};

export type ChangeEvent = {
	id?: string;
	point: Point;
	width: number;
	height: number;
};

export type FocusEvent = {
	id?: string;
};

export type ItemSelectEvent = {
	id?: string;
};
