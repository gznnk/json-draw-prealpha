import type { DiagramBaseProps } from "./DiagramBaseProps";
import type { SelectableProps } from "./SelectableProps";
import type { TransformativeProps } from "./TransformativeProps";
import type { ItemableProps } from "./ItemableProps";
import type { ConnectableProps } from "./ConnectableProps";
import type { TextableProps } from "./TextableProps";
import type { ExecutableProps } from "./ExecutableProps";
import type { FileDroppableProps } from "./FileDroppableProps";

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
