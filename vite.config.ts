import path from "node:path";

import react from "@vitejs/plugin-react-swc";
import license from "rollup-plugin-license";
import { defineConfig } from "vite";

const COPYRIGHT = `
Copyright (c) ${new Date().getFullYear()} msnakagawa. All Rights Reserved.
This software and its source code are proprietary and confidential.
No part of this software may be reproduced, distributed, or transmitted in any form or by any means.
Unauthorized copying of this file, via any medium is strictly prohibited.`;

// https://vite.dev/config/
export default defineConfig({
	// base: "/react-vite-project/",
	plugins: [react()],
	build: {
		outDir: "dist-web",
		rollupOptions: {
			plugins: [
				license({
					banner: {
						commentStyle: "ignored",
						content: COPYRIGHT,
					},
					thirdParty: {
						output: path.join(__dirname, "dist-web", "DEPENDENCIES"),
						includePrivate: true,
					},
				}),
			],
		},
	},
});
