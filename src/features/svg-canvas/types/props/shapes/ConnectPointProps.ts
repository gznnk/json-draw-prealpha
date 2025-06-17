// Import types related to SvgCanvas.
import type { CreateDiagramProps } from "../core/CreateDiagramProps";
import type { ConnectPointData } from "../../data/shapes/ConnectPointData";
import type { DiagramConnectEvent } from "../../events/DiagramConnectEvent";
import type { Shape } from "../../base/Shape";

/**
 * Connect point properties
 */
export type ConnectPointProps = CreateDiagramProps<
	ConnectPointData,
	{ connectable: true }
> & {
	ownerId: string;
	ownerShape: Shape; // Should be passed as memoized
	isTransparent: boolean;
	onConnect?: (e: DiagramConnectEvent) => void;
};
