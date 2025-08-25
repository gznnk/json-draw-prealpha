// Import React.
import type React from "react";
import { memo } from "react";

// Import types.
import type { TextAreaNodeProps } from "../../../types/props/nodes/TextAreaNodeProps";

// Import components related to SvgCanvas.
// import { RectangleMinimap } from "../../shapes/Rectangle/RectangleMinimap";

/**
 * TextAreaNode minimap component - lightweight version without outlines, controls, and labels.
 */
const TextAreaNodeMinimapComponent: React.FC<TextAreaNodeProps> = () => {
	return null;
};

export const TextAreaNodeMinimap = memo(TextAreaNodeMinimapComponent);
