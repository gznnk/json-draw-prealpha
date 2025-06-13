import { useEffect, useRef } from "react";

/**
 * Manages Ctrl key press state and provides access to it across components.
 * This hook sets up global keyboard event listeners to track Ctrl key state.
 *
 * @returns Object containing the current Ctrl key state reference
 */
export const useCtrl = () => {
	const isCtrlDown = useRef(false);

	useEffect(() => {
		const onDocumentKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Control") {
				isCtrlDown.current = true;
			}
		};

		const onDocumentKeyUp = (e: KeyboardEvent) => {
			if (e.key === "Control") {
				isCtrlDown.current = false;
			}
		};

		// Add event listeners for keydown and keyup events
		document.addEventListener("keydown", onDocumentKeyDown);
		document.addEventListener("keyup", onDocumentKeyUp);

		return () => {
			document.removeEventListener("keydown", onDocumentKeyDown);
			document.removeEventListener("keyup", onDocumentKeyUp);
		};
	}, []);

	return { isCtrlDown };
};
