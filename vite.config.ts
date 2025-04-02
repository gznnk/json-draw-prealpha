import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import license from "rollup-plugin-license";
import path from "node:path";

const COPYRIGHT = `
Copyright (c) ${new Date().getFullYear()} msnakagawa. All Rights Reserved.
This software and its source code are proprietary and confidential.
No part of this software may be reproduced, distributed, or transmitted in any form or by any means.
Unauthorized copying of this file, via any medium is strictly prohibited.`;

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	build: {
		rollupOptions: {
			plugins: [
				license({
					banner: {
						content: COPYRIGHT,
					},
					thirdParty: {
						output: path.join(__dirname, "dist", "DEPENDENCIES"),
						includePrivate: true,
					},
				}),
			],
		},
	},
});
