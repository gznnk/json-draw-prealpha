import type { SvgCanvasState } from "../../../canvas/SvgCanvasTypes";
import type { Diagram } from "../../../types/data/catalog/Diagram";
import type { ConnectLineData } from "../../../types/data/shapes/ConnectLineData";
import type { Shape } from "../../../types/base/Shape";
import { createBestConnectPath } from "../connectPoint/createBestConnectPath";
import { newId } from "../common/newId";
import { getDiagramById } from "../../common/getDiagramById";
import { isConnectableData } from "../../validation/isConnectableData";
import { calcRadians } from "../../math/points/calcRadians";
import { radiansToDegrees } from "../../math/common/radiansToDegrees";

/**
 * Updates connection lines that are connected to the given updated diagrams.
 * Updates both autoRouting enabled and disabled connection lines.
 *
 * @param updatedDiagrams - Array of diagrams that have been updated/transformed
 * @param updatingCanvasState - Current canvas state with updated shapes (excluding connect lines)
 * @param startCanvasState - Canvas state at the start of the operation (for autoRouting disabled lines)
 * @returns Updated canvas state with refreshed connect lines
 */
export const refreshConnectLines = (
	updatedDiagrams: Diagram[],
	updatingCanvasState: SvgCanvasState,
	startCanvasState?: SvgCanvasState,
): SvgCanvasState => {
	// Create a set of updated diagram IDs for efficient lookup
	const updatedDiagramIds = new Set(updatedDiagrams.map((d) => d.id));

	// Find all connect lines that need to be updated
	const updatedItems = updatingCanvasState.items.map((item) => {
		// Only process ConnectLine items
		if (item.type !== "ConnectLine") {
			return item;
		}

		const connectLine = item as ConnectLineData;

		// Check if either end of the connect line is connected to an updated diagram
		const isStartOwnerUpdated = updatedDiagramIds.has(connectLine.startOwnerId);
		const isEndOwnerUpdated = updatedDiagramIds.has(connectLine.endOwnerId);

		if (!isStartOwnerUpdated && !isEndOwnerUpdated) {
			return item;
		}

		// Find the start and end owner shapes using getDiagramById for recursive search
		const startOwnerShape = getDiagramById(
			updatingCanvasState.items,
			connectLine.startOwnerId,
		) as Shape;
		const endOwnerShape = getDiagramById(
			updatingCanvasState.items,
			connectLine.endOwnerId,
		) as Shape;

		// Skip if either owner shape is not found
		if (!startOwnerShape || !endOwnerShape) {
			return item;
		}

		// Skip if either owner shape doesn't have connect points
		if (
			!isConnectableData(startOwnerShape) ||
			!isConnectableData(endOwnerShape)
		) {
			return item;
		}

		// Get the start and end point IDs from the ConnectLine's items array
		const currentItems = connectLine.items;
		if (currentItems.length < 2) {
			return item;
		}

		const startPointId = currentItems[0].id;
		const endPointId = currentItems[currentItems.length - 1].id;

		// Find the connect points from the owner shapes using the point IDs
		const startConnectPoint = startOwnerShape.connectPoints.find(
			(cp) => cp.id === startPointId,
		);
		const endConnectPoint = endOwnerShape.connectPoints.find(
			(cp) => cp.id === endPointId,
		);

		// Skip if connect points are not found
		if (!startConnectPoint || !endConnectPoint) {
			return item;
		}

		if (connectLine.autoRouting) {
			// Auto-routing enabled: recalculate the optimal path
			const newPath = createBestConnectPath(
				startConnectPoint.x,
				startConnectPoint.y,
				startOwnerShape,
				endConnectPoint.x,
				endConnectPoint.y,
				endOwnerShape,
			);

			// Create new path point data
			const newItems = newPath.map((p, idx) => ({
				id: newId(),
				name: `cp-${idx}`,
				type: "PathPoint",
				x: p.x,
				y: p.y,
			})) as Diagram[];

			// Maintain IDs of both end points to preserve connection references
			newItems[0].id = startPointId;
			newItems[newItems.length - 1].id = endPointId;

			// Return updated connect line with new path
			return {
				...connectLine,
				items: newItems,
			} as ConnectLineData;
		}

		// Auto-routing disabled: maintain manual drag behavior
		if (!startCanvasState) {
			// If no start state provided, skip updating non-auto-routing lines
			return item;
		}

		// Get the original connect line from start state
		const originalConnectLine = getDiagramById(
			startCanvasState.items,
			connectLine.id,
		) as ConnectLineData;

		if (!originalConnectLine) {
			return item;
		}

		// Get original owner shapes from start state
		const originalStartOwner = getDiagramById(
			startCanvasState.items,
			connectLine.startOwnerId,
		) as Shape;
		const originalEndOwner = getDiagramById(
			startCanvasState.items,
			connectLine.endOwnerId,
		) as Shape;

		if (!originalStartOwner || !originalEndOwner) {
			return item;
		}

		// Skip if original owner shapes don't have connect points
		if (
			!isConnectableData(originalStartOwner) ||
			!isConnectableData(originalEndOwner)
		) {
			return item;
		}

		// Find original connect points
		const originalStartConnectPoint = originalStartOwner.connectPoints.find(
			(cp) => cp.id === startPointId,
		);
		const originalEndConnectPoint = originalEndOwner.connectPoints.find(
			(cp) => cp.id === endPointId,
		);

		if (!originalStartConnectPoint || !originalEndConnectPoint) {
			return item;
		}

		// Create movement data for endpoints (matches ConnectLine component logic)
		const startMovedData = {
			id: startPointId,
			x: startConnectPoint.x,
			y: startConnectPoint.y,
			moved:
				startConnectPoint.x !== originalStartConnectPoint.x ||
				startConnectPoint.y !== originalStartConnectPoint.y,
		};

		const endMovedData = {
			id: endPointId,
			x: endConnectPoint.x,
			y: endConnectPoint.y,
			moved:
				endConnectPoint.x !== originalEndConnectPoint.x ||
				endConnectPoint.y !== originalEndConnectPoint.y,
		};

		// If neither endpoint moved, skip
		if (!startMovedData.moved && !endMovedData.moved) {
			return item;
		}

		// Use original items for calculations (matches ConnectLine component behavior)
		const originalItems = originalConnectLine.items;

		// Check if all lines are vertical and horizontal only
		const isVerticalHorizontalLines = originalItems.every((item, idx) => {
			if (idx === 0) return true;

			const prev = originalItems[idx - 1];
			const radians = calcRadians(prev.x, prev.y, item.x, item.y);
			const degrees = radiansToDegrees(radians);
			return degrees % 90 === 0;
		});

		// Function to create new point (exact copy of ConnectLine component logic)
		const createNewPoint = (
			movedPoint: typeof startMovedData,
			oldPoint: Diagram,
			idx: number,
		) => {
			// Move end points along with connection point movement
			if (oldPoint.id === movedPoint.id) {
				return {
					...oldPoint,
					x: movedPoint.x,
					y: movedPoint.y,
				};
			}

			// Check if it's a point adjacent to the moved point
			const movedPointIdx = originalItems.findIndex(
				(item) => item.id === movedPoint.id,
			);
			const isNextPoint =
				(movedPointIdx === 0 && idx === 1) ||
				(movedPointIdx === originalItems.length - 1 &&
					idx === originalItems.length - 2);

			if (isNextPoint) {
				// If connection lines are not only vertical and horizontal, keep the second point as is
				if (!isVerticalHorizontalLines) {
					return oldPoint;
				}

				// For connection lines with only vertical and horizontal lines, move the second point to maintain this constraint

				// Calculate movement amount
				const movedPointOldData = originalItems[movedPointIdx];
				const dx = movedPoint.x - movedPointOldData.x;
				const dy = movedPoint.y - movedPointOldData.y;

				// Calculate angle between two points
				const direction = calcRadians(
					movedPointOldData.x,
					movedPointOldData.y,
					oldPoint.x,
					oldPoint.y,
				);
				const degrees = radiansToDegrees(direction);
				const isVertical = (degrees + 405) % 180 > 90;

				// If the line between two points is horizontal, move only x coordinate; if vertical, move only y coordinate
				return {
					...oldPoint,
					x: !isVertical ? oldPoint.x + dx : oldPoint.x,
					y: isVertical ? oldPoint.y + dy : oldPoint.y,
				};
			}

			return oldPoint;
		};

		// Create new items using the same logic as ConnectLine component
		const newItems = originalItems.map((item, idx) => {
			let newPoint = item;

			// Apply start point changes
			if (startMovedData.moved) {
				newPoint = createNewPoint(startMovedData, newPoint, idx);
			}

			// Apply end point changes (if different from start point)
			if (endMovedData.moved && newPoint === item) {
				newPoint = createNewPoint(endMovedData, newPoint, idx);
			}
			return newPoint;
		}) as Diagram[];

		// Return updated connect line with moved points
		return {
			...connectLine,
			items: newItems,
		} as ConnectLineData;
	});

	// Return the updated canvas state with refreshed connect lines
	return {
		...updatingCanvasState,
		items: updatedItems,
	};
};
