import { PathFeatures } from "../../../types/data/shapes/PathData";
import type { DiagramMenuConfig } from "../../../types/menu/DiagramMenuConfig";
import { createMenuConfig } from "../core/createMenuConfig";

/**
 * Menu configuration for Path shapes.
 * Border color, line style, group, and transformation options are enabled based on PathFeatures.
 */
export const PathMenuConfig: DiagramMenuConfig = createMenuConfig(PathFeatures);
