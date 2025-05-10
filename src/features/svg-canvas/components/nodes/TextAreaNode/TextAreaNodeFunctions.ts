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
		width: 400,
		height: 200,
		radius: 0,
		stroke: "transparent",
		strokeWidth: "1px",
		fill: "#1A1E2F",
		textType: "markdown",
		textAlign: "left",
		verticalAlign: "top",
		fontSize: 12,
		fontColor: "#A0A4B0",
	});

	data.type = "TextAreaNode";

	return data;
};
