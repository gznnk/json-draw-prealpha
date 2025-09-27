import type { PayloadContentType } from "./PayloadContentType";
import type { PayloadFormat } from "./PayloadFormat";

export type ExecutionPayload<T = unknown> = {
	format: PayloadFormat;
	data: T;
	metadata?: {
		contentType?: PayloadContentType;
	} & Record<string, unknown>;
};
