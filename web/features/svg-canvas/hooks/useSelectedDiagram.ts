import { useSvgCanvasState } from "../context/SvgCanvasStateContext";
import { Diagram } from "../types/state/core/Diagram";
import { getSelectedDiagrams } from "../utils/core/getSelectedDiagrams";

export const useSelectedDiagram = (): Diagram[] | undefined => {
	const canvasStateRef = useSvgCanvasState();
	return getSelectedDiagrams(canvasStateRef.current?.items || []);
};
