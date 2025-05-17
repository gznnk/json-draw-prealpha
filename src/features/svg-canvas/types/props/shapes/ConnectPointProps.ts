// Import types related to SvgCanvas.
import type { CreateDiagramProps } from "../core/CreateDiagramProps";
import type { ConnectPointData } from "../../data/shapes/ConnectPointData";
import type { DiagramConnectEvent } from "../../events/DiagramConnectEvent";
import type { Shape } from "../../base/Shape";

/**
 * 接続ポイントプロパティ
 */
export type ConnectPointProps = CreateDiagramProps<
	ConnectPointData,
	{ connectable: true }
> & {
	ownerId: string;
	ownerShape: Shape; // memo化して渡すこと
	isTransparent: boolean;
	onConnect?: (e: DiagramConnectEvent) => void;
};
