module.exports = {
	root: true,
	env: { browser: true, es2020: true },
	extends: [
		"prettier",
		"plugin:tailwindcss/recommended",
		"plugin:@typescript-eslint/recommended",
		"plugin:react/recommended",
		"plugin:react-hooks/recommended",
	],
	ignorePatterns: ["dist", ".eslintrc.cjs"],
	parser: "@typescript-eslint/parser",
	plugins: [
		"react-refresh",
		"tailwindcss",
		"simple-import-sort",
		"import",
		"unused-imports",
	],
	rules: {
		"react/react-in-jsx-scope": "off",
		"simple-import-sort/imports": [
			"error",
			{
				groups: [["^\\u0000"], ["^@?\\w"], ["^"], ["^\\."]],
			},
		],
		"simple-import-sort/exports": "error",
		"import/first": "error",
		"import/newline-after-import": "error",
		"import/no-duplicates": "error",
		"unused-imports/no-unused-imports": "error",
		"unused-imports/no-unused-vars": [
			"warn",
			{
				vars: "all",
				varsIgnorePattern: "^_",
				args: "after-used",
				argsIgnorePattern: "^_",
			},
		],
		"no-unused-vars": "off",
		"@typescript-eslint/no-unused-vars": [
			"error",
			{
				argsIgnorePattern: "^_",
				varsIgnorePattern: "^_",
				caughtErrorsIgnorePattern: "^_",
			},
		],
		"@typescript-eslint/explicit-function-return-type": "off",
		"react-refresh/only-export-components": [
			"warn",
			{ allowConstantExport: true },
		],
	},
}
