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
		radius: 4,
		stroke: "#A9A9A9",
		fill: "#ffffff",
		text: "図形作成",
		textType: "textarea",
		textAlign: "center",
		verticalAlign: "center",
		fontColor: "#333333",
	});

	data.type = "SvgToDiagramNode";

	return data;
};
