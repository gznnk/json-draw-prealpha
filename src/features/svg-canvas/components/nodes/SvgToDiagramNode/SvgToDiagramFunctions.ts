import { createRectangleData } from "../../shapes/Rectangle";

export const createSvgToDiagramNodeData = ({
	x,
	y,
}: {
	x: number;
	y: number;
}) => {
	const data = createRectangleData({
		x,
		y,
		stroke: "transparent",
		fill: "transparent",
	});

	data.type = "SvgToDiagramNode";

	return data;
};
