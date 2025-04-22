// Import React.
import type React from "react";
import { memo } from "react";

// Import types related to this component.
import type { ExecuteEvent, NewItemEvent } from "../../../types/EventTypes";
import type { Diagram } from "../../../types/DiagramCatalog";

// Import components related to SvgCanvas.
import { Rectangle, type RectangleProps } from "../../shapes/Rectangle";
import { Gachapon } from "../../icons/Gachapon";
import { IconContainer } from "../../core/IconContainer";

// Import hooks related to SvgCanvas.
import { useExecutionChain } from "../../../hooks/useExecutionChain";

// Import functions related to SvgCanvas.
import { createSvgDataFromText } from "../../shapes/Svg/SvgFunctions";

type SvgToDiagramProps = RectangleProps & {
	onExecute: (e: ExecuteEvent) => void;
	onNewItem: (e: NewItemEvent) => void;
};

const SvgToDiagramNodeComponent: React.FC<SvgToDiagramProps> = (props) => {
	useExecutionChain({
		id: props.id,
		onPropagation: (e) => {
			const data = e.data.text
				.replace("```svg", "")
				.replace("```xml", "")
				.replace("```", "");

			const svgData = createSvgDataFromText(data);
			if (!svgData) return;

			svgData.x = props.x + (Math.random() - 0.5) * 300;
			svgData.y = props.y + (Math.random() - 0.5) * 300;

			props.onNewItem({
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
				iconWidth={80}
				iconHeight={80}
				pointerEvents="none"
			>
				<Gachapon />
			</IconContainer>
			<Rectangle {...props} />
		</>
	);
};

export const SvgToDiagramNode = memo(SvgToDiagramNodeComponent);
