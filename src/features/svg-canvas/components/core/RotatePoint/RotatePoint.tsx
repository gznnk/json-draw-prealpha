// Import React.
import type React from "react";
import { memo, useCallback, useRef, useState } from "react";

// Import types.
import type { DiagramDragEvent } from "../../../types/events/DiagramDragEvent";

// Import hooks.
import type { DragProps } from "../../../hooks/useDrag";
import { useDrag } from "../../../hooks/useDrag";

// Import components.
import { RotateRight } from "../../icons/RotateRight";

/**
 * Props for RotatePoint component.
 */
type RotatePointProps = Omit<DragProps, "ref"> & {
	rotation?: number;
	color?: string;
	hidden?: boolean;
};

/**
 * The rotate point component.
 */
const RotatePointComponent: React.FC<RotatePointProps> = ({
	id,
	type,
	x,
	y,
	onDrag,
	dragPositioningFunction,
	rotation = 0,
	color = "rgba(100, 149, 237, 0.8)",
	hidden = false,
}) => {
	const [isDragging, setIsDragging] = useState(false);
	const svgRef = useRef<SVGCircleElement>({} as SVGCircleElement);

	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		onDrag,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	/**
	 * Handle drag event.
	 */
	const handleDrag = useCallback((e: DiagramDragEvent) => {
		if (e.eventType === "Start") setIsDragging(true);
		if (e.eventType === "End") setIsDragging(false);

		refBus.current.onDrag?.(e);
	}, []);

	// Create drag properties using the useDrag hook.
	const dragProps = useDrag({
		id,
		type,
		x,
		y,
		ref: svgRef,
		onDrag: handleDrag,
		dragPositioningFunction,
	});

	if (hidden) {
		return;
	}

	return (
		<>
			<g transform={`translate(${x} ${y}) rotate(${rotation})`}>
				<g transform="translate(-12 -12)">
					<RotateRight fill={color} />
				</g>
			</g>
			<circle
				id={id}
				cx={x}
				cy={y}
				r={7}
				fill="transparent"
				cursor="move"
				tabIndex={0}
				ref={svgRef}
				{...dragProps}
			/>
			{isDragging && (
				<text
					x={x + 16}
					y={y + 4}
					fill="#555555"
					fontSize="12px"
				>{`${rotation}˚`}</text>
			)}
		</>
	);
};

export const RotatePoint = memo(RotatePointComponent);
