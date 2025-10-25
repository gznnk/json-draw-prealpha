import { ConnectLineFeatures } from "../../../types/data/shapes/ConnectLineData";
import type { DiagramMenuConfig } from "../../../types/menu/DiagramMenuConfig";
import { createMenuConfig } from "../core/createMenuConfig";

/**
 * Menu configuration for ConnectLine shapes.
 * Only border color and line style options are enabled based on ConnectLineFeatures.
 */
export const ConnectLineMenuConfig: DiagramMenuConfig =
	createMenuConfig(ConnectLineFeatures);
