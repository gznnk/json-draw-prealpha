export type AddUnderscoreToProperties<T> = {
	[K in keyof T as `_${string & K}`]: T[K];
};

export type PartiallyRequired<T, K extends keyof T> = Required<Pick<T, K>> &
	Partial<Omit<T, K>>;
