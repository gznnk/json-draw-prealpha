import type { WorkRepository } from "./interface";
import { LocalStorageWorkRepository } from "./localStrageImpl";

export const createWorkRepository = (): WorkRepository => {
	return new LocalStorageWorkRepository();
};
