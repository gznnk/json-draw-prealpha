// Import functions related to SvgCanvas.
import { createRectangleData } from "../../../utils/shapes/rectangle";

export const createLLMNodeData = ({
	x,
	y,
	text,
}: {
	x: number;
	y: number;
	text?: string;
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
		text: text ?? "",
		keepProportion: true,
	});

	data.type = "LLMNode";

	return data;
};
