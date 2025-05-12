// Import React.
import type React from "react";
import { memo } from "react";

// Import types related to this component.
import type { CreateDiagramProps, RectangleProps } from "../../../types";
import type { Diagram } from "../../../catalog";

// Import components related to SvgCanvas.
import { DEFAULT_RECTANGLE_DATA, Rectangle } from "../../shapes/Rectangle";
import { Gachapon } from "../../icons/Gachapon";
import { IconContainer } from "../../core/IconContainer";

// Import hooks related to SvgCanvas.
import { useExecutionChain } from "../../../hooks/useExecutionChain";

// Import functions related to SvgCanvas.
import { createSvgDataFromText } from "../../shapes/Svg/SvgFunctions";
import { newEventId } from "../../../utils";
import { dispatchNewItemEvent } from "../../../canvas/observers/addNewItem";

/**
 * Props for the SvgToDiagramNode component.
 */
type SvgToDiagramNodeProps = CreateDiagramProps<
	RectangleProps,
	{
		executable: true;
	}
>;

/**
 * SvgToDiagramNode component.
 */
const SvgToDiagramNodeComponent: React.FC<SvgToDiagramNodeProps> = (props) => {
	useExecutionChain({
		id: props.id,
		onPropagation: (e) => {
			if (e.eventType !== "Instant" && e.eventType !== "End") return;

			const data = e.data.text
				.replace("```svg", "")
				.replace("```xml", "")
				.replace("```", "");

			const svgData = createSvgDataFromText(data);
			if (!svgData) return;

			svgData.x = props.x + (Math.random() - 0.5) * 300;
			svgData.y = props.y + (Math.random() - 0.5) * 300;

			dispatchNewItemEvent({
				eventId: newEventId(),
				item: svgData as Diagram,
			});
		},
	});

	return (
		<>
			<IconContainer
				x={props.x}
				y={props.y}
				width={props.width}
				height={props.height}
				rotation={props.rotation}
				scaleX={props.scaleX}
				scaleY={props.scaleY}
				pointerEvents="none"
			>
				<Gachapon width={props.width} height={props.height} />
			</IconContainer>
			<Rectangle
				{...DEFAULT_RECTANGLE_DATA}
				{...props}
				isTransparent
				isTextEditEnabled={false}
			/>
		</>
	);
};

export const SvgToDiagramNode = memo(SvgToDiagramNodeComponent);
