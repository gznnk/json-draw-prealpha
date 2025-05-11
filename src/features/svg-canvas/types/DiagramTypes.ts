// SvgCanvas関連型定義をインポート
import type { ConnectPointData } from "./shape";
import type {
	DiagramChangeEvent,
	DiagramClickEvent,
	DiagramConnectEvent,
	DiagramDragDropEvent,
	DiagramDragEvent,
	DiagramHoverEvent,
	DiagramSelectEvent,
	DiagramTextEditEvent,
	DiagramTransformEvent,
	ExecuteEvent,
	FileDropEvent,
} from "./EventTypes";
import type { DiagramBaseData } from "./base";
import type {
	FillableData,
	ItemableData,
	SelectableData,
	StrokableData,
	TextableData,
	TransformativeData,
} from "./core";

/**
 * 接続可能な図形のデータ
 */
export type ConnectableData = {
	connectPoints: ConnectPointData[];
};

/**
 * 図形の型作成オプション
 */
type DiagramDataOptions = {
	selectable?: boolean;
	transformative?: boolean;
	itemable?: boolean;
	connectable?: boolean;
	strokable?: boolean;
	fillable?: boolean;
	textable?: boolean;
};

/**
 * 図形のデータ型を作成する型
 */
export type CreateDiagramType<T extends DiagramDataOptions> = DiagramBaseData &
	(T["selectable"] extends true ? SelectableData : object) &
	(T["transformative"] extends true ? TransformativeData : object) &
	(T["itemable"] extends true ? ItemableData : object) &
	(T["connectable"] extends true ? ConnectableData : object) &
	(T["strokable"] extends true ? StrokableData : object) &
	(T["fillable"] extends true ? FillableData : object) &
	(T["textable"] extends true ? TextableData : object);

/**
 * 図形の基本プロパティ
 */
export type DiagramBaseProps = {
	isTransparent?: boolean;
	onDrag?: (e: DiagramDragEvent) => void;
	onDrop?: (e: DiagramDragDropEvent) => void;
	onClick?: (e: DiagramClickEvent) => void;
	onHover?: (e: DiagramHoverEvent) => void;
};

/**
 * 選択可能な図形のプロパティ
 */
export type SelectableProps = {
	onSelect?: (e: DiagramSelectEvent) => void;
};

/**
 * 変形可能な図形のプロパティ
 */
export type TransformativeProps = {
	onTransform?: (e: DiagramTransformEvent) => void;
};

/**
 * Props for having child diagrams component.
 *
 * @property {function} onDiagramChange - Event handler for diagram change.
 *                                        Trigger this handler when notifying changes in the properties of a diagram.
 */
export type ItemableProps = {
	onDiagramChange?: (e: DiagramChangeEvent) => void;
};

/**
 * Props for connectable component.
 *
 * @property {boolean} showConnectPoints - Visibility of owned ConnectPoint components.
 *                                         When false, the connectable component must not render ConnectPoint components.
 * @property {function} onConnect        - Event handler for diagram connection.
 *                                         The connectable component must trigger this event when a connection is made.
 */
export type ConnectableProps = {
	showConnectPoints?: boolean;
	onConnect?: (e: DiagramConnectEvent) => void;
};

/**
 * Props for textable component.
 */
export type TextableProps = {
	isTextEditEnabled?: boolean;
	onTextEdit?: (e: DiagramTextEditEvent) => void;
	onDiagramChange?: (e: DiagramChangeEvent) => void;
};

/**
 * Props for executable component.
 */
export type ExecutableProps = {
	onExecute?: (e: ExecuteEvent) => void;
};

/**
 * Props for file droppable component.
 */
export type FileDroppableProps = {
	onFileDrop?: (e: FileDropEvent) => void;
};

/**
 * Options for diagram properties creation.
 */
type DiagramPropsOptions = {
	selectable?: boolean;
	transformative?: boolean;
	itemable?: boolean;
	connectable?: boolean;
	textable?: boolean;
	executable?: boolean;
	itemCreatable?: boolean;
	fileDroppable?: boolean;
};

/**
 * Create diagram props type.
 * This type is used to create props for diagram components.
 */
export type CreateDiagramProps<T, U extends DiagramPropsOptions> = Omit<
	T,
	"type"
> &
	DiagramBaseProps &
	(U["selectable"] extends true ? SelectableProps : object) &
	(U["transformative"] extends true ? TransformativeProps : object) &
	(U["itemable"] extends true ? ItemableProps : object) &
	(U["connectable"] extends true ? ConnectableProps : object) &
	(U["textable"] extends true ? TextableProps : object) &
	(U["executable"] extends true ? ExecutableProps : object) &
	(U["fileDroppable"] extends true ? FileDroppableProps : object);
