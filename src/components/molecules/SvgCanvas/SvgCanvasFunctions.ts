import type { GroupData } from "./types/DiagramTypes";

// biome-ignore lint/suspicious/noExplicitAny: 型チェック関数のため
export const isGroupData = (obj: any): obj is GroupData => {
	return obj && typeof obj.type === "string" && obj.type === "group";
};
