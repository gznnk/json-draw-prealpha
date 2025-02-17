export type Point = {
	x: number;
	y: number;
};

export type ChangeEvent = {
	id?: string;
	point: Point;
	width: number;
	height: number;
};
