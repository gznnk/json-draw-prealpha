// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import type { CanvasHooksProps } from "../SvgCanvasTypes";

// Import functions related to SvgCanvas.
import { getSelectedItems } from "../SvgCanvasFunctions";
import { isSvgData } from "../../components/shapes/Svg";

/**
 * Custom hook to handle export events on the canvas.
 */
export const useExport = (props: CanvasHooksProps) => {
	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	return useCallback(() => {
		// Bypass references to avoid function creation in every render.
		const {
			canvasState: { items },
		} = refBus.current.props;

		const selectedItems = getSelectedItems(items);

		if (selectedItems.length === 1) {
			// Export the selected item as SVG.
			const selectedItem = selectedItems[0];
			if (isSvgData(selectedItem)) {
				const svgElement = document.createElementNS(
					"http://www.w3.org/2000/svg",
					"svg",
				);
				svgElement.setAttribute("width", selectedItem.width.toString());
				svgElement.setAttribute("height", selectedItem.height.toString());
				svgElement.setAttribute(
					"viewBox",
					`0 0 ${selectedItem.width} ${selectedItem.height}`,
				);
				svgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");
				svgElement.innerHTML = selectedItem.svgText || ""; // Assuming svgText contains the SVG content.

				const svgBlob = new Blob([svgElement.outerHTML], {
					type: "image/svg+xml",
				});
				const url = URL.createObjectURL(svgBlob);

				// Create a link element to download the SVG.
				const link = document.createElement("a");
				link.href = url;
				link.download = `${selectedItem.id}.svg`;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				URL.revokeObjectURL(url); // Clean up the URL object.
			}
		}
	}, []);
};
