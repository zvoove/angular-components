// @ts-check
const tseslint = require("typescript-eslint");
const vitest = require("eslint-plugin-vitest");
const rootConfig = require("../../eslint.config.js");

module.exports = tseslint.config(
  ...rootConfig,
  {
    files: ["**/*.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", {
        args: "all",
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
        destructuredArrayIgnorePattern: "^_",
        ignoreRestSiblings: true,
      }],
    },
  },
  {
    files: ["**/*.spec.ts"],
    plugins: {
      vitest: vitest,
    },
    rules: {
      ...vitest.configs.recommended.rules,
      "vitest/expect-expect": ["error", {
        assertFunctionNames: ["expect", "assert*", "sortAssert", "validate*"],
      }],
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    files: ["**/*.html"],
    rules: {},
  }
);
