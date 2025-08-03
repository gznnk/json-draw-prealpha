// Import React.
import type React from "react";
import { memo } from "react";

// Import types.
import type { SvgToDiagramNodeProps } from "../../../types/props/nodes/SvgToDiagramNodeProps";
import type { Diagram } from "../../../types/state/catalog/Diagram";

// Import components.
import { IconContainer } from "../../core/IconContainer";
import { Gachapon } from "../../icons/Gachapon";
import { Rectangle } from "../../shapes/Rectangle";

// Import constants.
import { DefaultRectangleState } from "../../../constants/state/shapes/DefaultRectangleState";

// Import hooks.
import { useAddDiagram } from "../../../hooks/useAddDiagram";
import { useExecutionChain } from "../../../hooks/useExecutionChain";

// Import utils.
import { createSvgStateFromText } from "../../../utils/shapes/svg/createSvgStateFromText";

/**
 * SvgToDiagramNode component.
 */
const SvgToDiagramNodeComponent: React.FC<SvgToDiagramNodeProps> = (props) => {
	// Create a function to add a new diagram.
	const addDiagram = useAddDiagram();

	// Use execution chain to handle the event propagation.
	useExecutionChain({
		id: props.id,
		onPropagation: (e) => {
			if (e.eventPhase !== "Instant" && e.eventPhase !== "Ended") return;

			const data = e.data.text
				.replace("```svg", "")
				.replace("```xml", "")
				.replace("```", "");

			const svgData = createSvgStateFromText(data);
			if (!svgData) return;

			svgData.x = props.x + (Math.random() - 0.5) * 300;
			svgData.y = props.y + (Math.random() - 0.5) * 300;

			addDiagram(svgData as Diagram);
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
				{...DefaultRectangleState}
				{...props}
				isTransparent
				isTextEditEnabled={false}
			/>
		</>
	);
};

export const SvgToDiagramNode = memo(SvgToDiagramNodeComponent);
