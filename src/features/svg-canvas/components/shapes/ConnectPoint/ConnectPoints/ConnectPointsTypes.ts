import type { ConnectPointData } from "../../../../types/data/shapes/ConnectPointData";
import type { DiagramConnectEvent } from "../../../../types/events/DiagramConnectEvent";
import type { PreviewConnectLineEvent } from "../../../../types/events/PreviewConnectLineEvent";
import type { Shape } from "../../../../types/base/Shape";

/**
 * Props for ConnectPoints component
 */
export type ConnectPointsProps = {
	/** Owner shape ID */
	ownerId: string;
	/** Owner shape properties */
	ownerShape: Shape;
	/** Array of connect points to render */
	connectPoints: ConnectPointData[];
	/** Whether to show connect points */
	isVisible: boolean;
	/** Whether interaction is active (makes connect points transparent for hover detection) */
	isActive: boolean;
	/** Connect event handler */
	onConnect?: (event: DiagramConnectEvent) => void;
	/** Preview connect line event handler */
	onPreviewConnectLine?: (event: PreviewConnectLineEvent) => void;
};
