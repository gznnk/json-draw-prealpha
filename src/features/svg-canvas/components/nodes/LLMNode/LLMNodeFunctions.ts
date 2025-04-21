import { createRectangleData } from "../../shapes/Rectangle";

export const createLLMNodeData = ({
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
		fill: "#0A0A37",
		textType: "textarea",
		textAlign: "center",
		verticalAlign: "center",
		fontColor: "white",
		fontSize: 12,
		keepProportion: true,
	});

	data.type = "LLMNode";

	return data;
};
