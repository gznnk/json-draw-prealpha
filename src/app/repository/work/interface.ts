import type { Work } from "../../model/Work";

export interface WorkRepository {
	saveWorks(works: Work[]): Promise<void>;
	getWorks(): Promise<Work[]>;
}
