import type React from "react";
import { memo } from "react";

import { CircleMarker } from "./Circle";
import { ConcaveTriangleMarker } from "./ConcaveTriangle";
import { TriangleMarker } from "./Triangle";

/**
 * MarkerDefs component.
 * Defines all SVG markers for arrow heads in a <defs> element.
 * These markers can be referenced by SVG paths using marker-start and marker-end attributes.
 * Markers use context-stroke to inherit the color from the path.
 */
const MarkerDefsComponent: React.FC = () => {
	return (
		<defs>
			<TriangleMarker />
			<ConcaveTriangleMarker />
			<CircleMarker />
		</defs>
	);
};

export const MarkerDefs = memo(MarkerDefsComponent);
