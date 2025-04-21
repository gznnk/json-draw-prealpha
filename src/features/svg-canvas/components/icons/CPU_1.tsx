import { memo } from "react";

export const CPU_1 = memo(() => {
	return (
		<>
			<rect x="0" y="0" width="80" height="80" rx="10" ry="10" fill="#0A0A37" />
			<g fill="none" stroke="#00D1B2" strokeWidth="2">
				<rect x="20" y="20" width="40" height="40" rx="5" ry="5" />
				<path d="M25 25 Q30 35, 40 30 T55 45" strokeLinecap="round" />
				<path d="M25 55 Q35 45, 40 50 T55 35" strokeLinecap="round" />
			</g>
			<rect x="2" y="37" width="6" height="6" fill="#00D1B2" />
			<rect x="72" y="37" width="6" height="6" fill="#00D1B2" />
			<rect x="37" y="2" width="6" height="6" fill="#00D1B2" />
			<rect x="37" y="72" width="6" height="6" fill="#00D1B2" />
		</>
	);
});
