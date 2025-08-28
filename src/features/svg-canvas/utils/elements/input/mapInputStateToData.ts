// Import types.
import type { InputData } from "../../../types/data/elements/InputData";

// Import constants.
import { InputDefaultData } from "../../../constants/data/elements/InputDefaultData";

// Import utils.
import { createStateToDataMapper } from "../../core/createStateToDataMapper";

export const inputStateToData = createStateToDataMapper<InputData>(
	InputDefaultData,
);