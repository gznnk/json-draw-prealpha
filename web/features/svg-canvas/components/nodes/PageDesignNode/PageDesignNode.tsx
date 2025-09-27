import type React from "react";
import { memo, useState } from "react";

import { RectangleDefaultState } from "../../../constants/state/shapes/RectangleDefaultState";
import { useEventBus } from "../../../context/EventBusContext";
import { useConnectedDiagrams } from "../../../hooks/useConnectedDiagrams";
import { useExecutionChain } from "../../../hooks/useExecutionChain";
import { useWebDesignTool } from "../../../tools/web_design";
import type { PageDesignNodeProps } from "../../../types/props/nodes/PageDesignNodeProps";
import { isPlainTextPayload } from "../../../utils/execution/isPlainTextPayload";
import { IconContainer } from "../../core/IconContainer";
import { PageDesign } from "../../icons/PageDesign";
import { Rectangle } from "../../shapes/Rectangle";

/**
 * PageDesignNode component.
 */
const PageDesignNodeComponent: React.FC<PageDesignNodeProps> = (props) => {
	const [isProcessing, setIsProcessing] = useState(false);
	const eventBus = useEventBus();
	const connectedDiagrams = useConnectedDiagrams(props.id);
	const webDesignHandler = useWebDesignTool(eventBus);

	// Find the first CanvasFrame type diagram
	const canvasFrame = connectedDiagrams.find(diagram => diagram.type === "CanvasFrame");
	const targetId = canvasFrame?.id;

	useExecutionChain({
		id: props.id,
		onPropagation: async (e) => {
			if (!isPlainTextPayload(e.payload)) return;
			const textData = e.payload.data;
			if (textData === "") return;
			if (e.eventPhase !== "Ended") return;

			setIsProcessing(true);
			props.onExecute?.({
				id: props.id,
				eventId: e.eventId,
				eventPhase: "Started",
				payload: {
					format: "text",
					data: "",
					metadata: {
						contentType: "plain",
					},
				},
			});

			try {
				if (!targetId) {
					throw new Error("No CanvasFrame connected to PageDesignNode");
				}

				const result = await webDesignHandler(targetId)({
					name: "web_design",
					arguments: { design_request: textData },
					callId: e.eventId,
				});
				props.onExecute?.({
					id: props.id,
					eventId: e.eventId,
					eventPhase: "Ended",
					payload: {
						format: "text",
						data: typeof result?.content === "string" ? result.content : "",
						metadata: {
							contentType: "plain",
						},
					},
				});
			} catch (error) {
				console.error("Error in PageDesignNode web design:", error);
				props.onExecute?.({
					id: props.id,
					eventId: e.eventId,
					eventPhase: "Ended",
					payload: {
						format: "text",
						data: "Error generating web design.",
						metadata: {
							contentType: "plain",
						},
					},
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
