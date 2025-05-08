import type { Diagram } from "../../../types/DiagramCatalog";
import {
	calcGroupBoxOfNoRotation,
	type GroupData,
} from "../../../components/shapes/Group";
import { nanToZero } from "../../math/common/nanToZero";
import { newId } from "../common/newId";
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

	const box = calcGroupBoxOfNoRotation(newData);

	const ret = {
		id: newId(),
		type: "Group",
		x: box.left + nanToZero(box.left + box.right) / 2,
		y: box.top + nanToZero(box.top + box.bottom) / 2,
		width: box.right - box.left,
		height: box.bottom - box.top,
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
