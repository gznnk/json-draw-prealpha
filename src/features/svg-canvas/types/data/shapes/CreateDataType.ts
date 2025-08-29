// Import types.
import type { CornerRoundableData } from "../core/CornerRoundableData";
import type { DiagramBaseData } from "../core/DiagramBaseData";
import type { FillableData } from "../core/FillableData";
import type { FrameableData } from "../core/FrameableData";
import type { ItemableData } from "../core/ItemableData";
import type { StrokableData } from "../core/StrokableData";
import type { TextableData } from "../core/TextableData";
import type { TransformativeData } from "../core/TransformativeData";
import type { ConnectableData } from "./ConnectableData";

// Import the new unified features type
import type { DiagramFeatures } from "../../core/DiagramFeatures";

/**
 * Generic type creator for diagram data types.
 * Conditionally includes feature interfaces based on provided features.
 */
export type CreateDataType<T extends DiagramFeatures> = DiagramBaseData &
	(T["frameable"] extends true ? FrameableData : object) &
	(T["transformative"] extends true ? TransformativeData : object) &
	(T["itemable"] extends true ? ItemableData<DiagramBaseData> : object) &
	(T["connectable"] extends true ? ConnectableData : object) &
	(T["strokable"] extends true ? StrokableData : object) &
	(T["fillable"] extends true ? FillableData : object) &
	(T["cornerRoundable"] extends true ? CornerRoundableData : object) &
	(T["textable"] extends true ? TextableData : object);
