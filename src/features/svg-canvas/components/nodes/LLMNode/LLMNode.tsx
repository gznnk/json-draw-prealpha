// Import React.
import type React from "react";
import { memo, useEffect, useState } from "react";
// import { Rectangle, type RectangleProps } from "../../shapes/Rectangle";
import type { ExecuteEvent } from "../../../types/EventTypes";
import { usePropagation } from "../../../hooks/usePropagation";
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

	usePropagation({
		id: props.id,
		onPropagation: async (e) => {
			if (e.data.text === "") return;

			const openai = new OpenAI({
				apiKey: apiKey,
				dangerouslyAllowBrowser: true, // ブラウザで直接使用する場合に必要
			});

			try {
				const response = await openai.chat.completions.create({
					model: "gpt-4o",
					messages: [
						{ role: "system", content: props.text },
						{ role: "user", content: e.data.text },
						// { role: "assistant", content: "申し訳ありませんが、天気情報にはアクセスできません。" }
					],
				});

				const responseText = response.choices[0].message.content;
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
