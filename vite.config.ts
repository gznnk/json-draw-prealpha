import path from "node:path";

import react from "@vitejs/plugin-react-swc";
import license from "rollup-plugin-license";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
	base: "/json-draw-prealpha/",
	plugins: [react()],
	build: {
		outDir: "dist-web",
		rollupOptions: {
			plugins: [
				license({
					thirdParty: {
						output: path.join(__dirname, "dist-web", "DEPENDENCIES"),
						includePrivate: true,
					},
				}),
			],
		},
	},
});
