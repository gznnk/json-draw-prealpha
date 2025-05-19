/**
 * Handles the creation of a new sheet.
 * Creates a sheet with the specified name and dispatches the corresponding event.
 *
 * @param functionCall - The function call information containing sheet_name
 * @returns Object containing the ID and sheet name or null if required arguments are missing
 */

import { newId } from "../../../features/svg-canvas/utils/shapes/common/newId";
import { dispatchAddNewSheetEvent } from "../../App";
import type {
	FunctionCallHandler,
	FunctionCallInfo,
} from "../../../shared/llm-client/types";

export const handler: FunctionCallHandler = (
	functionCall: FunctionCallInfo,
) => {
	const args = functionCall.arguments as { sheet_name: string };

	if (typeof args.sheet_name === "string") {
		const id = newId();
		dispatchAddNewSheetEvent({
			id,
			sheetName: args.sheet_name,
		});

		return {
			id,
			sheet_name: args.sheet_name,
		};
	}

	return null;
};
