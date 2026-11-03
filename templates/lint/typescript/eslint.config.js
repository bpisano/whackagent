// whackagent — ESLint, every rule an error, run with --max-warnings 0.
// Built from the typescript convention module: each block cites the section it enforces.
// Edit freely: /wa-update proposes new plugin rules, never overwrites yours.
// Agents never edit this file or add `eslint-disable`.
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist/", "build/", "coverage/", "node_modules/"] },
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    linterOptions: { reportUnusedDisableDirectives: "error", noInlineConfig: true },
    rules: {
      // typescript → Strict types
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/explicit-module-boundary-types": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      // typescript → Idiomatic
      "prefer-const": "error",
      "no-var": "error",
      "@typescript-eslint/prefer-nullish-coalescing": "error",
      "@typescript-eslint/prefer-optional-chain": "error",
      // typescript → Async
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/require-await": "error",
      // leftovers agents forget
      "no-console": "error",
      "no-warning-comments": ["error", { terms: ["todo", "fixme", "xxx"] }],
      "no-debugger": "error",
      // typescript → Modules (no_default_export)
      "no-restricted-syntax": [
        "error",
        { selector: "ExportDefaultDeclaration", message: "Named exports only." },
      ],
    },
  },
  {
    files: ["**/*.js", "**/*.mjs", "**/*.cjs"],
    ...tseslint.configs.disableTypeChecked,
  },
  {
    files: ["**/*.config.*"],   // tools load their config as a default export
    rules: { "no-restricted-syntax": "off" },
  },
);
