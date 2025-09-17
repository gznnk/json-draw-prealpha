// Import React.
import type React from "react";
import { memo, useState } from "react";

// Import components related to SvgCanvas.
import { IconContainer } from "../../core/IconContainer";
import { PageDesign } from "../../icons/PageDesign";
import { Rectangle } from "../../shapes/Rectangle";

// Import constants.
import { RectangleDefaultState } from "../../../constants/state/shapes/RectangleDefaultState";

// Import hooks related to SvgCanvas.
import { useExecutionChain } from "../../../hooks/useExecutionChain";

// Import tools.
import { useWebDesignTool } from "../../../tools/web_design";

// Import context.
import { useEventBus } from "../../../context/EventBusContext";

// Import related to this component.
import type { PageDesignNodeProps } from "../../../types/props/nodes/PageDesignNodeProps";

/**
 * PageDesignNode component.
 */
const PageDesignNodeComponent: React.FC<PageDesignNodeProps> = (props) => {
	const [isProcessing, setIsProcessing] = useState(false);
	const eventBus = useEventBus();
	const webDesignHandler = useWebDesignTool(eventBus);

	useExecutionChain({
		id: props.id,
		onPropagation: async (e) => {
			if (e.data.text === "") return;
			if (e.eventPhase !== "Ended") return;

			setIsProcessing(true);
			props.onExecute?.({
				id: props.id,
				eventId: e.eventId,
				eventPhase: "Started",
				data: { text: "" },
			});

			try {
				const result = await webDesignHandler({
					name: "web_design",
					arguments: { design_request: e.data.text },
					callId: e.eventId,
				});
				props.onExecute?.({
					id: props.id,
					eventId: e.eventId,
					eventPhase: "Ended",
					data: {
						text: typeof result?.content === "string" ? result.content : "",
					},
				});
			} catch (error) {
				console.error("Error in PageDesignNode web design:", error);
				props.onExecute?.({
					id: props.id,
					eventId: e.eventId,
					eventPhase: "Ended",
					data: { text: "Error generating web design." },
				});
			} finally {
				setIsProcessing(false);
			}
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
			>
				<PageDesign
					width={props.width}
					height={props.height}
					animation={isProcessing}
				/>
			</IconContainer>
			<Rectangle
				{...RectangleDefaultState}
				{...props}
				isTransparent
				isTextEditing={false}
				isTextEditEnabled={false}
			/>
		</>
	);
};

export const PageDesignNode = memo(PageDesignNodeComponent);
