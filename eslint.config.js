import { resolve } from "node:path";

import js from "@eslint/js";
import prettierConfig from "eslint-config-prettier";
import boundariesPlugin from "eslint-plugin-boundaries";
import importPlugin from "eslint-plugin-import";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
	{
		ignores: ["dist-web", "dist-desktop", "node_modules", ".dependency-graph"],
	},
	{
		extends: [
			js.configs.recommended,
			...tseslint.configs.recommended,
			prettierConfig,
		],
		files: ["**/*.{js,jsx,ts,tsx}"],
		languageOptions: {
			ecmaVersion: 2023,
			globals: globals.browser,
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
			},
		},
		plugins: {
			react,
			"react-hooks": reactHooks,
			import: importPlugin,
			boundaries: boundariesPlugin,
		},
		settings: {
			react: {
				version: "detect",
			},
			"boundaries/root-path": resolve(import.meta.dirname),
			"boundaries/include": ["web/**/*.{ts,tsx,js,jsx}"],
			"boundaries/ignore": [
				"web/main.tsx",
				"web/vite-env.d.ts",
				"**/*.test.*",
				"**/*.spec.*",
			],
			"boundaries/elements": [
				// svg-canvas internal module boundaries (specific patterns first)
				{
					type: "svg-canvas-types",
					pattern: "features/svg-canvas/types/*",
					mode: "folder",
				},
				{
					type: "svg-canvas-constants",
					pattern: "features/svg-canvas/constants/*",
					mode: "folder",
				},
				{
					type: "svg-canvas-registry",
					pattern: "features/svg-canvas/registry/*",
					mode: "folder",
				},
				{
					type: "svg-canvas-utils",
					pattern: "features/svg-canvas/utils/*",
					mode: "folder",
				},
				{
					type: "svg-canvas-hooks",
					pattern: "features/svg-canvas/hooks/*",
					mode: "folder",
				},
				{
					type: "svg-canvas-components",
					pattern: "features/svg-canvas/components/*",
					mode: "folder",
				},
				{
					type: "svg-canvas-canvas",
					pattern: "features/svg-canvas/canvas/*",
					mode: "folder",
				},

				// Feature boundaries
				{
					type: "features-llm-chat-ui",
					pattern: "features/llm-chat-ui/*",
					mode: "folder",
				},
				{
					type: "features-markdown-editor",
					pattern: "features/markdown-editor/*",
					mode: "folder",
				},
				{
					type: "features-svg-canvas",
					pattern: "features/svg-canvas/*",
					mode: "folder",
				},

				// General boundaries (broader patterns last)
				{
					type: "app",
					pattern: "web/app/*",
					mode: "folder",
				},
				{
					type: "shared",
					pattern: "web/shared/*",
					mode: "folder",
				},
				{
					type: "utils",
					pattern: "web/utils/*",
					mode: "folder",
				},
			],
		},
		rules: {
			// React rules
			...react.configs.recommended.rules,
			...react.configs["jsx-runtime"].rules,
			"react/prop-types": "off",

			// React hooks rules
			...reactHooks.configs.recommended.rules,

			// Import rules
			"import/order": [
				"error",
				{
					groups: [
						"builtin",
						"external",
						"internal",
						["parent", "sibling"],
						"index",
					],
					"newlines-between": "always",
					alphabetize: {
						order: "asc",
						caseInsensitive: true,
					},
				},
			],
			"import/newline-after-import": "error",
			"import/no-duplicates": "error",

			// TypeScript rules
			"@typescript-eslint/no-unused-vars": [
				"error",
				{
					argsIgnorePattern: "^_",
					varsIgnorePattern: "^_",
				},
			],
			"@typescript-eslint/no-explicit-any": "error",
			"@typescript-eslint/consistent-type-imports": [
				"error",
				{
					prefer: "type-imports",
					disallowTypeAnnotations: true,
					fixStyle: "separate-type-imports",
				},
			],

			// General rules
			"prefer-const": "error",
			"no-var": "error",
			"object-shorthand": "error",
			"prefer-template": "error",

			// Boundaries rules
			// "boundaries/no-unknown-files": "error",
			"boundaries/element-types": [
				"error",
				{
					default: "disallow",
					rules: [
						{
							from: "app",
							allow: [
								"features-llm-chat-ui",
								"features-markdown-editor",
								"svg-canvas-components",
								"svg-canvas-constants",
								"svg-canvas-types",
								"svg-canvas-hooks",
								"svg-canvas-registry",
								"svg-canvas-utils",
								"shared",
								"utils",
							],
						},
						{
							from: "shared",
							allow: [],
						},
						// svg-canvas internal module rules (based on dependency-rules.md)
						{
							from: "svg-canvas-constants",
							allow: ["svg-canvas-types"],
						},
						{
							from: "svg-canvas-registry",
							allow: ["svg-canvas-types"],
						},
						{
							from: "svg-canvas-utils",
							allow: [
								"svg-canvas-constants",
								"svg-canvas-types",
								"svg-canvas-registry",
							],
						},
						{
							from: "svg-canvas-hooks",
							allow: [
								"svg-canvas-constants",
								"svg-canvas-types",
								"svg-canvas-registry",
								"svg-canvas-utils",
							],
						},
						{
							from: "svg-canvas-components",
							allow: [
								"svg-canvas-constants",
								"svg-canvas-types",
								"svg-canvas-hooks",
								"svg-canvas-registry",
								"svg-canvas-utils",
							],
						},
						{
							from: "svg-canvas-canvas",
							allow: [
								"svg-canvas-components",
								"svg-canvas-constants",
								"svg-canvas-types",
								"svg-canvas-hooks",
								"svg-canvas-registry",
								"svg-canvas-utils",
							],
						},
					],
				},
			],
		},
	},
);
