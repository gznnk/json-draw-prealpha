// Import types related to SvgCanvas.
import type { CreateDiagramProps } from "../core/CreateDiagramProps";
import type { ConnectPointData } from "../../data";
import type { DiagramConnectEvent } from "../../events";
import type { Shape } from "../..";

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
