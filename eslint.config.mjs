import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import tseslint from "typescript-eslint";

// eslint-config-next already registers the @typescript-eslint plugin and parser,
// so take only the rule presets to avoid redefining the plugin.
const typeCheckedPresets = [
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
]
  .filter((preset) => preset.rules !== undefined)
  .map(({ name, rules }) => ({ name, rules, files: ["**/*.{ts,tsx}"] }));

const LIB_BARREL_ONLY = {
  group: ["@/lib/*/*"],
  message: "Import lib modules through their barrel, e.g. `@/lib/text`.",
};

const SERVER_ONLY_MODULES = {
  group: ["@/lib/gemini", "@/lib/config", "@/features/*/server/*"],
  message: "Server-only module: client code must call the API route instead.",
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...typeCheckedPresets,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/switch-exhaustiveness-check": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "no-restricted-syntax": [
        "error",
        {
          selector: "TSUnknownKeyword",
          message:
            "Do not use `unknown`. Narrow external data with a Zod schema, or convert caught errors with `toAppError`.",
        },
      ],
    },
  },
  {
    files: ["src/**/*.{ts,tsx}", "tests/**/*.ts"],
    rules: { "no-restricted-imports": ["error", { patterns: [LIB_BARREL_ONLY] }] },
  },
  {
    // Client code must never pull in server-only modules (API keys, Gemini SDK).
    files: [
      "src/**/components/**/*.tsx",
      "src/**/hooks/**/*.ts",
      "src/features/*/api/**/*.ts",
    ],
    rules: {
      "no-restricted-imports": ["error", { patterns: [LIB_BARREL_ONLY, SERVER_ONLY_MODULES] }],
    },
  },
  {
    // The single boundary where untyped values (caught errors) become typed.
    files: ["src/lib/errors/app-error.ts"],
    rules: { "no-restricted-syntax": "off" },
  },
  {
    files: ["tests/**/*.test.ts"],
    rules: { "@typescript-eslint/require-await": "off" },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
