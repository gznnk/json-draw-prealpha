// Import data types.
import type { DiagramBaseData } from "../core/DiagramBaseTypes";
import type { FillableData } from "../core/FillableTypes";
import type { ItemableData } from "../core/ItemableTypes";
import type { StrokableData } from "../core/StrokableTypes";
import type { TextableData } from "../core/TextableTypes";
import type { TransformativeData } from "../core/TransformativeTypes";

// Import state types.
import type { DiagramBaseState } from "../core/DiagramBaseTypes";
import type { FillableState } from "../core/FillableTypes";
import type { ItemableState } from "../core/ItemableTypes";
import type { SelectableState } from "../core/SelectableTypes";
import type { StrokableState } from "../core/StrokableTypes";
import type { TextableState } from "../core/TextableTypes";
import type { TransformativeState } from "../core/TransformativeTypes";

// Import props types.
import type { DiagramBaseProps } from "../core/DiagramBaseTypes";
import type { SelectableProps } from "../core/SelectableTypes";
import type { TransformativeProps } from "../core/TransformativeTypes";
import type { ItemableProps } from "../core/ItemableTypes";
import type { ConnectableProps } from "./ConnectableTypes";
import type { TextableProps } from "../core/TextableTypes";
import type { ExecutableProps } from "../core/ExecutableTypes";
import type { FileDroppableProps } from "../core/FileDroppableTypes";

// Import local types.
import type { ConnectableData, ConnectableState } from "./ConnectableTypes";

/**
 * Options for creating diagram data types.
 * Controls which feature interfaces should be included in the resulting type.
 */
export type DiagramDataOptions = {
	transformative?: boolean;
	itemable?: boolean;
	connectable?: boolean;
	strokable?: boolean;
	fillable?: boolean;
	textable?: boolean;
};

/**
 * Generic type creator for diagram data types.
 * Conditionally includes feature interfaces based on provided options.
 */
export type CreateDataType<T extends DiagramDataOptions> = DiagramBaseData &
	(T["transformative"] extends true ? TransformativeData : object) &
	(T["itemable"] extends true ? ItemableData<DiagramBaseData> : object) &
	(T["connectable"] extends true ? ConnectableData : object) &
	(T["strokable"] extends true ? StrokableData : object) &
	(T["fillable"] extends true ? FillableData : object) &
	(T["textable"] extends true ? TextableData : object);

/**
 * Options for creating diagram state types.
 * Controls which feature interfaces should be included in the resulting type.
 */
export type DiagramStateOptions = {
	selectable?: boolean;
	transformative?: boolean;
	itemable?: boolean;
	connectable?: boolean;
	strokable?: boolean;
	fillable?: boolean;
	textable?: boolean;
};

/**
 * Create state type.
 * This type conditionally merges different state interfaces based on specified options,
 * allowing components to selectively inherit specific behaviors and state properties.
 */
export type CreateStateType<
	T extends DiagramBaseData,
	U extends DiagramStateOptions,
> = T &
	DiagramBaseState &
	(U["selectable"] extends true ? SelectableState : object) &
	(U["transformative"] extends true ? TransformativeState : object) &
	(U["itemable"] extends true ? ItemableState<DiagramBaseState> : object) &
	(U["connectable"] extends true ? ConnectableState : object) &
	(U["strokable"] extends true ? StrokableState : object) &
	(U["fillable"] extends true ? FillableState : object) &
	(U["textable"] extends true ? TextableState : object);

/**
 * Options for diagram properties creation.
 * Controls which feature interfaces should be included in the resulting component props.
 */
export type DiagramPropsOptions = {
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
 * This type conditionally merges different props interfaces based on specified options,
 * allowing components to selectively inherit specific behaviors and event handlers.
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
