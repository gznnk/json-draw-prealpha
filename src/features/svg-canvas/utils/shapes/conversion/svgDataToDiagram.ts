// Import types.
import type { Diagram } from "../../../types/data/catalog/Diagram";
import type { GroupData } from "../../../types/data/shapes/GroupData";

// Import utils.
import { calcUnrotatedGroupBoundingBox } from "../group/calcUnrotatedGroupBoundingBox";
import { nanToZero } from "../../math/common/nanToZero";
import { newId } from "../common/newId";

// Import conversion functions.
import { rectElementToDiagram } from "./rectElementToDiagram";
import { ellipseElementToDiagram } from "./ellipseElementToDiagram";
import { circleElementToDiagram } from "./circleElementToDiagram";
import { lineElementToDiagram } from "./lineElementToDiagram";

/**
 * SVG data string to Diagram data.
 *
 * @param data - SVG data string
 * @returns Converted diagram data
 */
export const svgDataToDiagram = (data: string): GroupData => {
	const parser = new DOMParser();
	const svgDoc = parser.parseFromString(data, "image/svg+xml");
	const svgElement = svgDoc.documentElement;
	const newData: Diagram[] = [];

	for (const element of svgElement.children) {
		const tagName = element.tagName;
		try {
			if (tagName === "rect") {
				newData.push(rectElementToDiagram(element as SVGRectElement));
			} else if (tagName === "ellipse") {
				newData.push(ellipseElementToDiagram(element as SVGEllipseElement));
			} else if (tagName === "circle") {
				newData.push(circleElementToDiagram(element as SVGCircleElement));
			} else if (tagName === "line") {
				newData.push(lineElementToDiagram(element as SVGLineElement));
			} else {
				// throw new Error("Unsupported SVG element was found.");
			}
		} catch (e) {
			// Ignore the error and continue processing other elements.
			console.error(e);
		}
	}

	const boundingBox = calcUnrotatedGroupBoundingBox(newData);

	const ret = {
		id: newId(),
		type: "Group",
		x: boundingBox.left + nanToZero(boundingBox.left + boundingBox.right) / 2,
		y: boundingBox.top + nanToZero(boundingBox.top + boundingBox.bottom) / 2,
		width: boundingBox.right - boundingBox.left,
		height: boundingBox.bottom - boundingBox.top,
		rotation: 0,
		scaleX: 1,
		scaleY: 1,
		isSelected: false,
		isMultiSelectSource: false,
		items: newData,
	} as GroupData;

	console.log("svgDataToDiagram", ret);

	return ret;
};
