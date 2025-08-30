// Import types.
import type { DiagramFeatures } from "../../core/DiagramFeatures";
import type { ConnectableProps } from "../core/ConnectableProps";
import type { DiagramBaseProps } from "../core/DiagramBaseProps";
import type { ExecutableProps } from "../core/ExecutableProps";
import type { FileDroppableProps } from "../core/FileDroppableProps";
import type { ItemableProps } from "../core/ItemableProps";
import type { SelectableProps } from "../core/SelectableProps";
import type { TextableProps } from "../core/TextableProps";
import type { TransformativeProps } from "../core/TransformativeProps";

// Import shared modules.
import type { Prettify } from "../../../../../shared/utility-types";

/**
 * Create diagram props type with unified features.
 * This type conditionally merges different props interfaces based on specified features,
 * allowing components to selectively inherit specific behaviors and event handlers.
 */
export type CreateDiagramProps<T, U extends DiagramFeatures> = Prettify<
	Omit<T, "type" | "itemableType"> &
		DiagramBaseProps &
		(U["selectable"] extends true ? SelectableProps : object) &
		(U["transformative"] extends true ? TransformativeProps : object) &
		(U["itemable"] extends true ? ItemableProps : object) &
		(U["connectable"] extends true ? ConnectableProps : object) &
		(U["textable"] extends true ? TextableProps : object) &
		(U["executable"] extends true ? ExecutableProps : object) &
		(U["fileDroppable"] extends true ? FileDroppableProps : object)
>;
