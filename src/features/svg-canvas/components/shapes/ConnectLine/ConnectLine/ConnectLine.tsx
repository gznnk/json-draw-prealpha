// Import React.
import type React from "react";
import { memo, useCallback, useRef } from "react";

// Import types.
import type { ConnectLineProps } from "../../../../types/props/shapes/ConnectLineProps";
import type { DiagramChangeEvent } from "../../../../types/events/DiagramChangeEvent";

// Import components related to SvgCanvas.
import { Path } from "../../Path";

/**
 * ConnectLine component.
 */
const ConnectLineComponent: React.FC<ConnectLineProps> = ({
	id,
	x,
	y,
	width,
	height,
	rotation,
	scaleX,
	scaleY,
	stroke = "black",
	strokeWidth = "1px",
	isSelected = false,
	items = [],
	startArrowHead,
	endArrowHead,
	onClick,
	onSelect,
	onDiagramChange,
}) => {
	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		onDiagramChange,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	/**
	 * Handle Path component change event.
	 */
	const handlePathChange = useCallback((e: DiagramChangeEvent) => {
		refBus.current.onDiagramChange?.({
			...e,
			endDiagram: {
				...e.endDiagram,
				autoRouting: false,
			},
		});
	}, []);

	return (
		<Path
			id={id}
			x={x}
			y={y}
			width={width}
			height={height}
			rotation={rotation}
			scaleX={scaleX}
			scaleY={scaleY}
			keepProportion={false}
			stroke={stroke}
			strokeWidth={strokeWidth}
			isSelected={isSelected}
			showTransformControls={false}
			showOutline={false}
			isTransforming={false}
			dragEnabled={false}
			transformEnabled={false}
			verticesModeEnabled={true}
			rightAngleSegmentDrag={true}
			fixBothEnds={true}
			startArrowHead={startArrowHead}
			endArrowHead={endArrowHead}
			items={items}
			onClick={onClick}
			onSelect={onSelect}
			onDiagramChange={handlePathChange}
		/>
	);
};

export const ConnectLine = memo(ConnectLineComponent);
