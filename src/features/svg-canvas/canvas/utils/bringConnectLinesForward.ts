// Import types.
import type { ConnectLineState } from "../../types/state/shapes/ConnectLineState";
import type { Diagram } from "../../types/state/core/Diagram";

// Import utils.
import { isConnectLineState } from "../../utils/validation/isConnectLineState";
import { collectDiagramIds } from "./collectDiagramIds";

/**
 * Brings connect lines forward that are connected to the specified diagrams.
 * This ensures that connection lines are rendered on top of other elements
 * when the connected diagrams are grouped or processed together.
 * 
 * @param items - Array of diagram items to reorder
 * @param targetDiagrams - Array of diagrams whose connected lines should be brought forward
 * @returns Reordered array with connect lines at the end
 */
export const bringConnectLinesForward = (
	items: Diagram[],
	targetDiagrams: Diagram[],
): Diagram[] => {
	const groupedDiagramIds = collectDiagramIds(targetDiagrams);
	const targetConnectLines: ConnectLineState[] = [];
	
	for (const diagram of items) {
		if (
			isConnectLineState(diagram) &&
			(groupedDiagramIds.includes(diagram.startOwnerId) ||
				groupedDiagramIds.includes(diagram.endOwnerId))
		) {
			targetConnectLines.push(diagram);
		}
	}
	
	const orderedItems = [
		...items.filter(
			(item) =>
				!targetConnectLines.some(
					(connectLine) => connectLine.id === item.id,
				),
		),
		...targetConnectLines,
	];
	
	return orderedItems;
};