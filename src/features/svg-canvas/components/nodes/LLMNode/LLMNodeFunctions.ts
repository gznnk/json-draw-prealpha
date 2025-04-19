import { createEllipseData } from "../../shapes/Ellipse";

export const createLLMNodeData = ({
	x,
	y,
}: {
	x: number;
	y: number;
}) => {
	const data = createEllipseData({
		x,
		y,
		stroke: "#A9A9A9",
		fill: "#ffffff",
		textType: "textarea",
		textAlign: "center",
		verticalAlign: "center",
		fontColor: "#333333",
	});

	data.type = "LLMNode";

	return data;
};
