import type { MarkdownRepository } from "./interface";
import { LocalStorageMarkdownRepository } from "./localStorageImpl";

export const createMarkdownRepository = (): MarkdownRepository => {
	return new LocalStorageMarkdownRepository();
};
