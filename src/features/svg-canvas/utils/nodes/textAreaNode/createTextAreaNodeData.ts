// Import utils.
import { createRectangleData } from "../../shapes/rectangle/createRectangleData";

/**
 * Creates data for a TextArea node with specified properties.
 *
 * @param x - The x coordinate of the node
 * @param y - The y coordinate of the node
 * @returns TextArea node data object
 */
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
		radius: 6,
		stroke: "#d9d9d9",
		strokeWidth: "1px",
		fill: "#ffffff",
		textType: "markdown",
		textAlign: "left",
		verticalAlign: "top",
		fontSize: 14,
		fontColor: "rgba(0, 0, 0, 0.88)",
	});

	data.type = "TextAreaNode";

	return data;
};
