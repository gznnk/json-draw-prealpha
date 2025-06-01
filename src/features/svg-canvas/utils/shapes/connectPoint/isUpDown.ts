import type { Direction } from "../../../components/shapes/ConnectPoint/ConnectPoint/ConnectPointTypes";

/**
 * Checks if direction is up or down.
 *
 * @param direction - The direction to check
 * @returns True if direction is up or down
 */
export const isUpDown = (direction: Direction): boolean => {
	return direction === "up" || direction === "down";
};
