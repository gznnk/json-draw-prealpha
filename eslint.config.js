import js from "@eslint/js";
import prettierConfig from "eslint-config-prettier";
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
		},
		settings: {
			react: {
				version: "detect",
			},
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
		},
	},
);
