export type ItemableType =
	| "concrete" // An item that has its own geometry (its shape is defined intrinsically)
	| "abstract"; // An item that has no intrinsic geometry (its shape is derived from its children)
