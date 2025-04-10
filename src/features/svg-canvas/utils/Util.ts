/**
 * イベントIDを生成する
 *
 * @returns イベントID
 */
export const newEventId = (): string => crypto.randomUUID();

/**
 * Make a deep copy of an object.
 *
 * @param obj - The object to be copied.
 * @returns A deep copy of the object.
 */
export const deepCopy = <T>(obj: T): T => {
	if (obj === null || typeof obj !== "object") {
		return obj;
	}

	if (Array.isArray(obj)) {
		return obj.map((item) => deepCopy(item)) as unknown as T;
	}

	// biome-ignore lint/suspicious/noExplicitAny: Bcause the type of obj is unknown, we need to use any to avoid type errors.
	const result = {} as Record<string, any>;

	for (const key of Object.keys(obj) as Array<keyof typeof obj>) {
		result[key as string] = deepCopy(obj[key]);
	}

	return result as T;
};
