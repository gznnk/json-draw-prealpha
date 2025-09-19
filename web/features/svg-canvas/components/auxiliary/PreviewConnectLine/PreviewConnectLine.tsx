import { memo } from "react";

import type { PreviewConnectLineProps } from "./PreviewConnectLineTypes";
import { Path } from "../../shapes/Path";

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
