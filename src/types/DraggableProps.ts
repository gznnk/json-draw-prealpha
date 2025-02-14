import type Point from "./Point";

type DraggableProps = {
	initialPoint: Point;
	onDragStart?: (x: number, y: number) => void;
	onDrag?: (x: number, y: number) => void;
	onDragEnd?: (x: number, y: number) => void;
};

export default DraggableProps;
