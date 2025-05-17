// Import utils.
import { createRectangleData } from "../../shapes/rectangle";

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
