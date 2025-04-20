// Import React.
import type React from "react";
import { memo, useEffect, useState } from "react";
// import { Rectangle, type RectangleProps } from "../../shapes/Rectangle";
import type { ExecuteEvent } from "../../../types/EventTypes";
import { useExecutionChain } from "../../../hooks/useExecutionChain";
import { newEventId } from "../../../utils/Util";
import { Ellipse, type EllipseProps } from "../../shapes/Ellipse/Ellipse";
import { OpenAI } from "openai";

// Import utilities.
import { OpenAiKeyManager } from "../../../../../utils/KeyManager";

type LLMProps = EllipseProps & {
	onExecute: (e: ExecuteEvent) => void;
};

const LLMNodeComponent: React.FC<LLMProps> = (props) => {
	const [apiKey, setApiKey] = useState<string>("");

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

			const openai = new OpenAI({
				apiKey: apiKey,
				dangerouslyAllowBrowser: true, // ブラウザで直接使用する場合に必要
			});

			try {
				const response = await openai.responses.create({
					model: "gpt-4o",
					instructions: props.text,
					input: e.data.text,
				});

				const responseText = response.output_text;
				if (responseText) {
					props.onExecute({
						id: props.id,
						eventId: newEventId(),
						data: {
							text: responseText,
						},
					});
				} else {
					alert("APIからの応答が空です。");
				}
			} catch (error) {
				console.error("Error fetching data from OpenAI API:", error);
				alert("APIリクエスト中にエラーが発生しました。");
			}
		},
	});

	return <Ellipse {...props} />;
};

export const LLMNode = memo(LLMNodeComponent);
