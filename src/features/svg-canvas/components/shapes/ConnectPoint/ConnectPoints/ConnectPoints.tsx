// Import React.
import type React from "react";
import { memo } from "react";

// Import components.
import { ConnectPoint } from "..";

// Import types.
import type { ConnectPointsProps } from "./ConnectPointsTypes";

/**
 * Container component for rendering multiple connect points
 */
const ConnectPointsComponent: React.FC<ConnectPointsProps> = ({
	ownerId,
	ownerShape,
	connectPoints,
	isVisible,
	isActive,
	onConnect,
	onPreviewConnectLine,
}) => {
	// Don't render if connect points should not be shown
	if (!isVisible) {
		return null;
	}

	return (
		<>
			{connectPoints.map((cp) => (
				<ConnectPoint
					key={cp.id}
					id={cp.id}
					name={cp.name}
					x={cp.x}
					y={cp.y}
					ownerId={ownerId}
					ownerShape={ownerShape}
					isTransparent={isActive}
					onConnect={onConnect}
					onPreviewConnectLine={onPreviewConnectLine}
				/>
			))}
		</>
	);
};

export const ConnectPoints = memo(ConnectPointsComponent);
