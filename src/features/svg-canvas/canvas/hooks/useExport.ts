// Import React.
import { useCallback, useRef } from "react";

// Import types related to SvgCanvas.
import { DiagramExportFunctions } from "../../catalog/DiagramExportFunctions";
import type { CanvasHooksProps } from "../SvgCanvasTypes";

// Import functions related to SvgCanvas.
import { getSelectedItems } from "../SvgCanvasFunctions";

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

		for (const item of selectedItems) {
			const blob = DiagramExportFunctions[item.type]?.(item);
			if (blob) {
				const url = URL.createObjectURL(blob);

				// TODO: 共通化
				const mimeToExt: Record<string, string> = {
					"image/png": "png",
					"image/jpeg": "jpg",
					"image/svg+xml": "svg",
					"image/gif": "gif",
					"image/webp": "webp",
					"application/pdf": "pdf",
					"text/plain": "txt",
					// 必要に応じて追加
				};

				const ext = mimeToExt[blob.type] || "txt"; // Default to txt if type is unknown.

				// Create a link element to download the SVG.
				const link = document.createElement("a");
				link.href = url;
				link.download = `${item.id}.${ext}`;
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				URL.revokeObjectURL(url); // Clean up the URL object.
			}
		}
	}, []);
};
