import type {
	DiagramBaseProps,
	SelectableProps,
	TransformativeProps,
	ItemableProps,
	ConnectableProps,
	TextableProps,
	ExecutableProps,
	FileDroppableProps,
} from "./";

/**
 * Options for diagram properties creation.
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
