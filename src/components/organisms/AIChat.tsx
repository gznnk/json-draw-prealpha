import type React from "react";
import { useState, useEffect } from "react";
import { OpenAI } from "openai";

type AIChatProps = {
	onResponse: (response: string) => void;
};

const AIChat: React.FC<AIChatProps> = ({ onResponse }) => {
	const [apiKey, setApiKey] = useState<string>("");
	const [systemRole, setSystemRole] =
		useState<string>(`作図アプリケーションのバックエンドで動く、ユーザーの入力を受けてそれに対応する図形データを生成するノード。
データはJSON形式で、配列の中に複数の図形のデータをオブジェクトとして持つ。
回答はJSONデータのみを返し、JSON内にコメントは記載しない。`);
	const [userPrompt, setUserPrompt] = useState<string>("");
	const [response, setResponse] = useState<string>("");

	useEffect(() => {
		const storedApiKey = localStorage.getItem("openai_api_key");
		if (storedApiKey) {
			setApiKey(storedApiKey);
		}
	}, []);

	const handleSaveApiKey = () => {
		localStorage.setItem("openai_api_key", apiKey);
		alert("APIキーを保存しました！");
	};

	const handleSendRequest = async () => {
		if (!apiKey) {
			alert("APIキーを入力してください！");
			return;
		}

		try {
			const openai = new OpenAI({
				apiKey: apiKey,
				dangerouslyAllowBrowser: true, // ブラウザで直接使用する場合に必要
			});

			const prompt = `
以下の個々の図形のデータ構造を参考に、ユーザーの入力に基づいて図形データを生成してほしいです。

１．四角形のデータ
---------------------------------------
type: Rectangle（固定値）
x: 中心X座標
y: 中心y座標
width: 幅
height: 高さ
rotation: 図形の中心を原点として回転（度単位）
fill: 図形の塗りつぶしの色（HEX表記）
stroke: 図形の枠線の色（HEX表記）
strokeWidth: 図形の枠線の太さ（px単位）
---------------------------------------

２．楕円のデータ
---------------------------------------
type: Ellipse（固定値）
x: 中心X座標
y: 中心y座標
width: 幅
height: 高さ
rotation: 図形の中心を原点として回転（度単位）
fill: 図形の塗りつぶしの色（HEX表記）
stroke: 図形の枠線の色（HEX表記）
strokeWidth: 図形の枠線の太さ（px単位）
---------------------------------------

回答はJSONデータのみを返すこと。JSON内にコメントは記載しないこと。

上記のデータ構造を参考に、以下のユーザーの入力に基づいて図形データを生成してください。
ユーザーの入力: ${userPrompt}
			`;

			const response = await openai.chat.completions.create({
				model: "gpt-4o",
				messages: [
					{ role: "system", content: systemRole },
					{ role: "user", content: prompt },
					// { role: "assistant", content: "申し訳ありませんが、天気情報にはアクセスできません。" }
				],
			});
			setResponse(response.choices[0].message.content ?? "");
			onResponse(
				response.choices[0].message.content
					?.replace("```json", "")
					.replace("```", "") ?? "",
			);
		} catch (error) {
			console.error("Error fetching data from OpenAI API:", error);
			alert("APIリクエスト中にエラーが発生しました。");
		}
	};

	return (
		<div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
			<h1>AI Chat</h1>
			<div style={{ marginBottom: "20px" }}>
				<label>
					APIキー:
					<input
						type="password"
						placeholder="Enter your OpenAI API key"
						value={apiKey}
						onChange={(e) => setApiKey(e.target.value)}
						style={{ width: "100%", marginBottom: "10px" }}
					/>
				</label>
				<button type="button" onClick={handleSaveApiKey}>
					保存
				</button>
			</div>
			<div style={{ marginBottom: "20px" }}>
				<label>
					Role: System:
					<textarea
						value={systemRole}
						onChange={(e) => setSystemRole(e.target.value)}
						style={{ width: "100%", height: "60px", marginBottom: "10px" }}
					/>
				</label>
			</div>
			<div style={{ marginBottom: "20px" }}>
				<label>
					Role: User (プロンプト):
					<textarea
						value={userPrompt}
						onChange={(e) => setUserPrompt(e.target.value)}
						style={{ width: "100%", height: "60px", marginBottom: "10px" }}
					/>
				</label>
			</div>
			<div style={{ marginBottom: "20px" }}>
				<button type="button" onClick={handleSendRequest}>
					送信
				</button>
			</div>
			<div>
				<label>
					APIからの回答:
					<textarea
						value={response}
						readOnly
						style={{
							width: "100%",
							height: "100px",
							backgroundColor: "#f0f0f0",
						}}
					/>
				</label>
			</div>
		</div>
	);
};

export default AIChat;
