// Import types.
import type { ButtonData } from "../../../types/data/elements/ButtonData";

// Import constants.
import { ButtonDefaultData } from "../../../constants/data/elements/ButtonDefaultData";

// Import utils.
import { createStateToDataMapper } from "../../core/createStateToDataMapper";

export const mapButtonStateToData = createStateToDataMapper<ButtonData>(
	ButtonDefaultData,
);