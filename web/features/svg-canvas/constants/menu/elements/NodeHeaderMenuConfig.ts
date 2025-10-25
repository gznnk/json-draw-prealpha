import { NodeHeaderFeatures } from "../../../types/data/elements/NodeHeaderData";
import type { DiagramMenuConfig } from "../../../types/menu/DiagramMenuConfig";
import { createMenuConfig } from "../core/createMenuConfig";

/**
 * Menu configuration for NodeHeader elements.
 * Menu options are enabled based on NodeHeaderFeatures.
 */
export const NodeHeaderMenuConfig: DiagramMenuConfig =
	createMenuConfig(NodeHeaderFeatures);
