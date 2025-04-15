// Import React.
import { useCallback } from "react";

/**
 * Custom hook for handling file drop events.
 */
const useFileDrop = () => {
	const onDragOver = useCallback<React.DragEventHandler>((event) => {
		event.preventDefault();
	}, []);

	const onDrop = useCallback<React.DragEventHandler>((event) => {
		event.preventDefault();
		const files = event.dataTransfer.files;
		if (files && files.length > 0) {
			console.log("Dropped files:", files);
		}
	}, []);

	return { onDragOver, onDrop };
};

export default useFileDrop;
