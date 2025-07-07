import { radiansToDegrees } from "../../math/common/radiansToDegrees";
import type { Direction } from "../../../components/shapes/ConnectPoint/ConnectPointTypes";

/**
 * Converts radians to direction based on angle degrees.
 *
 * @param radians - The angle in radians
 * @returns The direction corresponding to the angle
 */
export const getDirection = (radians: number): Direction => {
	const degrees = Math.round(radiansToDegrees(radians));
	if (degrees <= 45 || 315 <= degrees) {
		return "up";
	}
	if (45 < degrees && degrees < 135) {
		return "right";
	}
	if (135 <= degrees && degrees <= 225) {
		return "down";
	}
	return "left";
};
