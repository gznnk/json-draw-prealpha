// Import React.
import { memo } from "react";

// Import types.
import type { PathData } from "../../../types/data/shapes/PathData";

// Import components.
import { Path } from "../Path";

/**
 * Props for PreviewConnectLine component.
 */
export type PreviewConnectLineProps = {
	/** The path data for the preview connection line. When undefined, nothing is rendered. */
	pathData?: PathData;
};

/**
 * Component for rendering a preview connection line.
 *
 * This component exists to ensure that the preview connection line is rendered
 * on top of all other shapes. It is positioned at the front of the render order
 * in SvgCanvas to achieve this visual layering effect.
 */
const PreviewConnectLineComponent: React.FC<PreviewConnectLineProps> = ({
	pathData,
}) => {
	if (!pathData) {
		return null;
	}

	return <Path {...pathData} />;
};

export const PreviewConnectLine = memo(PreviewConnectLineComponent);
