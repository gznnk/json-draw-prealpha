// Import utils.
import { createRectangleData } from "../../shapes/rectangle/createRectangleData";

/**
 * Creates data for an LLM node with specified properties.
 *
 * @param x - The x coordinate of the node
 * @param y - The y coordinate of the node
 * @param text - Optional text content of the node
 * @returns LLM node data object
 */
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
