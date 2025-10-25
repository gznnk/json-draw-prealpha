import { FrameFeatures } from "../../../types/data/elements/FrameData";
import type { DiagramMenuConfig } from "../../../types/menu/DiagramMenuConfig";
import { createMenuConfig } from "../core/createMenuConfig";

/**
 * Menu configuration for Frame elements.
 * Menu options are enabled based on FrameFeatures.
 */
export const FrameMenuConfig: DiagramMenuConfig =
	createMenuConfig(FrameFeatures);
