// Import React.
import type React from "react";
import { memo, useEffect, useRef, useState } from "react";

// Import other libraries.
import { OpenAI } from "openai";

// Import components related to SvgCanvas.
import { IconContainer } from "../../core/IconContainer";
import { Rectangle } from "../../shapes/Rectangle";

// Import constants.
import { DefaultRectangleState } from "../../../constants/state/shapes/DefaultRectangleState";

// Import hooks related to SvgCanvas.
import { useExecutionChain } from "../../../hooks/useExecutionChain";

// Import functions related to SvgCanvas.
import { newEventId } from "../../../utils/core/newEventId";

// Import utilities.
import { OpenAiKeyManager } from "../../../../../utils/KeyManager";

// Import related to this component.
import type { WebSearchNodeProps } from "../../../types/props/nodes/WebSearchNodeProps";
import { WebSearch } from "../../icons/WebSearch";

/**
 * WebSearchNode component.
 */
const WebSearchNodeComponent: React.FC<WebSearchNodeProps> = (props) => {
	const [apiKey, setApiKey] = useState<string>("");
	const [processIdList, setProcessIdList] = useState<string[]>([]);

	const refBusVal = { props };
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	useEffect(() => {
		const storedApiKey = OpenAiKeyManager.loadKey();
		if (storedApiKey) {
			setApiKey(storedApiKey);
		}
	}, []);

	useExecutionChain({
		id: props.id,
		onPropagation: async (e) => {
			if (e.data.text === "") return;
			if (e.eventPhase !== "Instant" && e.eventPhase !== "Ended") return;

			const processId = newEventId();
			setProcessIdList((prev) => [...prev, processId]);

			const openai = new OpenAI({
				apiKey: apiKey,
				dangerouslyAllowBrowser: true,
			});

			try {
				const stream = await openai.responses.create({
					model: "gpt-4.1",
					tools: [{ type: "web_search_preview" }],
					input: e.data.text,
					tool_choice: "required",
					stream: true,
				});

				let fullOutput = "";

				const eventId = newEventId();

				props.onExecute?.({
					id: props.id,
					eventId,
					eventPhase: "Started",
					data: {
						text: "",
					},
				});

				for await (const event of stream) {
					if (event.type === "response.output_text.delta") {
						const delta = event.delta;
						fullOutput += delta;

						props.onExecute?.({
							id: props.id,
							eventId,
							eventPhase: "InProgress",
							data: {
								text: fullOutput,
							},
						});
					}

					if (event.type === "response.output_text.done") {
						props.onExecute?.({
							id: props.id,
							eventId,
							eventPhase: "Ended",
							data: {
								text: fullOutput,
							},
						});
					}
				}
			} catch (error) {
				console.error("Error fetching data from OpenAI API:", error);
				alert("An error occurred during API request.");
			}

			setProcessIdList((prev) => prev.filter((id) => id !== processId));
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
				<WebSearch
					width={props.width}
					height={props.height}
					animation={processIdList.length !== 0}
				/>
			</IconContainer>
			<Rectangle
				{...DefaultRectangleState}
				{...props}
				isTransparent
				isTextEditing={false}
				isTextEditEnabled={false}
			/>
		</>
	);
};

export const WebSearchNode = memo(WebSearchNodeComponent);
