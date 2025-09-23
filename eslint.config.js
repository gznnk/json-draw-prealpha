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
		files: ["**/*.{js,ts,tsx}"],
		languageOptions: {
			ecmaVersion: 2020,
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
			"boundaries/elements": [
				{
					type: "app",
					pattern: "src/app/**/*",
				},
				{
					type: "features",
					pattern: "src/features/**/*",
				},
				{
					type: "shared",
					pattern: "src/shared/**/*",
				},
				// svg-canvas internal module boundaries
				{
					type: "svg-canvas-types-core",
					pattern: "src/features/svg-canvas/types/core/**/*",
				},
				{
					type: "svg-canvas-types-data",
					pattern: "src/features/svg-canvas/types/data/**/*",
				},
				{
					type: "svg-canvas-types-state",
					pattern: "src/features/svg-canvas/types/state/**/*",
				},
				{
					type: "svg-canvas-types-events",
					pattern: "src/features/svg-canvas/types/events/**/*",
				},
				{
					type: "svg-canvas-types-props",
					pattern: "src/features/svg-canvas/types/props/**/*",
				},
				{
					type: "svg-canvas-constants",
					pattern: "src/features/svg-canvas/constants/**/*",
				},
				{
					type: "svg-canvas-registry",
					pattern: "src/features/svg-canvas/registry/**/*",
				},
				{
					type: "svg-canvas-utils",
					pattern: "src/features/svg-canvas/utils/**/*",
				},
				{
					type: "svg-canvas-hooks",
					pattern: "src/features/svg-canvas/hooks/**/*",
				},
				{
					type: "svg-canvas-components-icons",
					pattern: "src/features/svg-canvas/components/icons/**/*",
				},
				{
					type: "svg-canvas-components-core",
					pattern: "src/features/svg-canvas/components/core/**/*",
				},
				{
					type: "svg-canvas-components-shapes",
					pattern: "src/features/svg-canvas/components/shapes/**/*",
				},
				{
					type: "svg-canvas-components-nodes",
					pattern: "src/features/svg-canvas/components/nodes/**/*",
				},
				{
					type: "svg-canvas-components-menus",
					pattern: "src/features/svg-canvas/components/menus/**/*",
				},
				{
					type: "svg-canvas-canvas",
					pattern: "src/features/svg-canvas/canvas/**/*",
				},
			],
			"boundaries/ignore": ["**/*.test.*", "**/*.spec.*"],
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
			"boundaries/element-types": [
				"error",
				{
					default: "disallow",
					rules: [
						{
							from: "app",
							allow: ["features", "shared"],
						},
						{
							from: "features",
							allow: ["shared"],
						},
						{
							from: "shared",
							allow: [],
						},
						// svg-canvas internal module rules
						// types module rules
						{
							from: "svg-canvas-types-data",
							allow: ["svg-canvas-types-core"],
						},
						{
							from: "svg-canvas-types-state",
							allow: ["svg-canvas-types-core", "svg-canvas-types-data"],
						},
						{
							from: "svg-canvas-types-events",
							allow: ["svg-canvas-types-core", "svg-canvas-types-data", "svg-canvas-types-state"],
						},
						{
							from: "svg-canvas-types-props",
							allow: ["svg-canvas-types-core", "svg-canvas-types-data", "svg-canvas-types-state", "svg-canvas-types-events"],
						},
						// General rules (constants, registry, utils, hooks, components, canvas)
						{
							from: "svg-canvas-constants",
							allow: ["svg-canvas-types-core", "svg-canvas-types-data", "svg-canvas-types-state", "svg-canvas-types-events", "svg-canvas-types-props"],
						},
						{
							from: "svg-canvas-registry",
							allow: ["svg-canvas-types-core", "svg-canvas-types-data", "svg-canvas-types-state", "svg-canvas-types-events", "svg-canvas-types-props"],
						},
						{
							from: "svg-canvas-utils",
							allow: ["svg-canvas-constants", "svg-canvas-registry", "svg-canvas-types-core", "svg-canvas-types-data", "svg-canvas-types-state", "svg-canvas-types-events", "svg-canvas-types-props"],
						},
						{
							from: "svg-canvas-hooks",
							allow: ["svg-canvas-constants", "svg-canvas-registry", "svg-canvas-utils", "svg-canvas-types-core", "svg-canvas-types-data", "svg-canvas-types-state", "svg-canvas-types-events", "svg-canvas-types-props"],
						},
						// components module rules
						{
							from: "svg-canvas-components-core",
							allow: ["svg-canvas-components-icons"],
						},
						{
							from: "svg-canvas-components-shapes",
							allow: ["svg-canvas-components-core", "svg-canvas-components-icons"],
						},
						{
							from: "svg-canvas-components-nodes",
							allow: ["svg-canvas-components-shapes", "svg-canvas-components-core", "svg-canvas-components-icons"],
						},
						{
							from: "svg-canvas-components-menus",
							allow: ["svg-canvas-components-icons"],
						},
						// General components rules (allow access to lower layers)
						{
							from: ["svg-canvas-components-icons", "svg-canvas-components-core", "svg-canvas-components-shapes", "svg-canvas-components-nodes", "svg-canvas-components-menus"],
							allow: ["svg-canvas-constants", "svg-canvas-registry", "svg-canvas-utils", "svg-canvas-hooks", "svg-canvas-types-core", "svg-canvas-types-data", "svg-canvas-types-state", "svg-canvas-types-events", "svg-canvas-types-props"],
						},
						// canvas module rules
						{
							from: "svg-canvas-canvas",
							allow: ["svg-canvas-components-icons", "svg-canvas-components-core", "svg-canvas-components-shapes", "svg-canvas-components-nodes", "svg-canvas-components-menus", "svg-canvas-constants", "svg-canvas-registry", "svg-canvas-utils", "svg-canvas-hooks", "svg-canvas-types-core", "svg-canvas-types-data", "svg-canvas-types-state", "svg-canvas-types-events", "svg-canvas-types-props"],
						},
					],
				},
			],
		},
	},
);
