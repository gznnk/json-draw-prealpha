// Import React.
import type React from "react";
import { memo, useEffect, useState, useRef } from "react";

// Import other libraries.
import { OpenAI } from "openai";

// Import types related to SvgCanvas.
import type { ExecuteEvent } from "../../../types/EventTypes";

// Import components related to SvgCanvas.
import { Rectangle, type RectangleProps } from "../../shapes/Rectangle";
import { IconContainer } from "../../core/IconContainer";
import { CPU_1 } from "../../icons/CPU_1";

// Import hooks related to SvgCanvas.
import { useExecutionChain } from "../../../hooks/useExecutionChain";

// Import functions related to SvgCanvas.
import { newEventId } from "../../../utils/Util";

// Import utilities.
import { OpenAiKeyManager } from "../../../../../utils/KeyManager";

// Import related to this component.
import { RectangleWrapper } from "./LLMNodeStyled";

/**
 * Props for the LLMNode component.
 */
type LLMProps = RectangleProps & {
	onExecute: (e: ExecuteEvent) => void;
};

/**
 * LLMNode component.
 */
const LLMNodeComponent: React.FC<LLMProps> = (props) => {
	const [apiKey, setApiKey] = useState<string>("");
	const [processIdList, setProcessIdList] = useState<string[]>([]);

	// Create references bypass to avoid function creation in every render.
	const refBusVal = {
		props,
	};
	const refBus = useRef(refBusVal);
	refBus.current = refBusVal;

	// Load the API key from local storage when the component mounts.
	useEffect(() => {
		const storedApiKey = OpenAiKeyManager.loadKey();
		if (storedApiKey) {
			setApiKey(storedApiKey);
		}
	}, []);

	// Handle execution events for the LLM node.
	useExecutionChain({
		id: props.id,
		onPropagation: async (e) => {
			if (e.data.text === "") return;
			if (e.eventType !== "Instant" && e.eventType !== "End") return;

			const processId = newEventId();
			setProcessIdList((prev) => [...prev, processId]);

			const openai = new OpenAI({
				apiKey: apiKey,
				dangerouslyAllowBrowser: true, // ブラウザで直接使用する場合に必要
			});

			try {
				const stream = await openai.responses.create({
					model: "gpt-4o",
					instructions: props.text,
					input: e.data.text,
					stream: true,
				});

				let fullOutput = "";

				props.onExecute({
					id: props.id,
					eventId: newEventId(),
					eventType: "Start",
					data: {
						text: "",
					},
				});

				for await (const event of stream) {
					if (event.type === "response.output_text.delta") {
						const delta = event.delta;
						fullOutput += delta;

						props.onExecute({
							id: props.id,
							eventId: newEventId(),
							eventType: "InProgress",
							data: {
								text: fullOutput,
							},
						});
					}
				}

				props.onExecute({
					id: props.id,
					eventId: newEventId(),
					eventType: "End",
					data: {
						text: fullOutput,
					},
				});
			} catch (error) {
				console.error("Error fetching data from OpenAI API:", error);
				alert("APIリクエスト中にエラーが発生しました。");
			}

			setProcessIdList((prev) => prev.filter((id) => id !== processId));
		},
	});

	return (
		<>
			{!props.isTextEditing && (
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
				>
					<CPU_1 blink={processIdList.length !== 0} />
				</IconContainer>
			)}
			<RectangleWrapper visible={props.isTextEditing}>
				<Rectangle {...props} />
			</RectangleWrapper>
		</>
	);
};

export const LLMNode = memo(LLMNodeComponent);
