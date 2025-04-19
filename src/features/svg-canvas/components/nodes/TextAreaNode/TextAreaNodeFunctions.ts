import { createRectangleData } from "../../shapes/Rectangle";

export const createTextAreaNodeData = ({
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
		textType: "textarea",
		textAlign: "left",
		verticalAlign: "top",
		fontColor: "#333333",
	});

	data.type = "TextAreaNode";

	return data;
};
