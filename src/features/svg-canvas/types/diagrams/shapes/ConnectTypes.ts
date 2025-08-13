import type {
	CreateDataType,
	CreateDiagramProps,
	CreateStateType,
} from "./CreateDiagramTypes";
import type { ArrowHeadType } from "../../core/ArrowHeadType";
import type {
	DiagramBaseData,
	DiagramBaseState,
} from "../core/DiagramBaseTypes";
import type { Shape } from "../../core/Shape";
import type { DiagramConnectEvent } from "../../events/DiagramConnectEvent";
import type { PreviewConnectLineEvent } from "../../events/PreviewConnectLineEvent";

/**
 * Data type for connection lines between diagram elements.
 * Contains properties for defining connection endpoints and visual styling.
 */
export type ConnectLineData = CreateDataType<{
	transformative: true;
	itemable: true;
	strokable: true;
}> & {
	startOwnerId: string;
	endOwnerId: string;
	autoRouting: boolean;
	startArrowHead?: ArrowHeadType;
	endArrowHead?: ArrowHeadType;
};

/**
 * State type for connection lines between diagram elements.
 * Contains properties for defining connection endpoints and visual styling.
 */
export type ConnectLineState = CreateStateType<
	ConnectLineData,
	{
		selectable: true;
		transformative: true;
		itemable: true;
		strokable: true;
	}
>;

/**
 * Props for ConnectLine component.
 */
export type ConnectLineProps = CreateDiagramProps<
	ConnectLineState,
	{
		selectable: true;
		transformative: true;
		itemable: true;
	}
>;

/**
 * Data type for connection points.
 * Defines properties for points where connections between diagram elements can be made.
 */
export type ConnectPointData = DiagramBaseData & {
	name: string;
};

/**
 * State type for connection points.
 * Defines properties for points where connections between diagram elements can be made.
 */
export type ConnectPointState = ConnectPointData & DiagramBaseState;

/**
 * Connect point properties
 */
export type ConnectPointProps = Omit<ConnectPointState, "type"> & {
	ownerId: string;
	ownerShape: Shape; // Should be passed as memoized
	alwaysVisible: boolean; // Whether to always show the connect point, even when not hovered.
	onConnect?: (e: DiagramConnectEvent) => void;
	onPreviewConnectLine?: (e: PreviewConnectLineEvent) => void;
};
