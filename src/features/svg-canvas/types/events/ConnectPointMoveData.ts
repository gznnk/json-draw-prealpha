import type { Shape } from "../base/Shape";

/**
 * Data structure for connection point movement
 *
 * @property id - ID of the moved connection point
 * @property name - Name of the connection point
 * @property x - Destination X coordinate
 * @property y - Destination Y coordinate
 * @property ownerId - ID of the owner of the connection point
 * @property ownerShape - Shape of the owner (used for redrawing connections; the shape of the
 *                       connection target's owner is retrieved within the connection line component)
 */
export type ConnectPointMoveData = {
	id: string;
	name: string;
	x: number;
	y: number;
	ownerId: string;
	ownerShape: Shape;
};
