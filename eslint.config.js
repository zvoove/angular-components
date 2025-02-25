// @ts-check
const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");
const jasmine = require("eslint-plugin-jasmine");

/** @type tseslint.ConfigWithExtends */
const baseTsLintConfig = {
  rules: {
    "@angular-eslint/directive-selector": [
      "error",
      {
        type: ["attribute", "element"],
        prefix: "zv",
      },
    ],
    "@angular-eslint/component-selector": [
      "error",
      {
        type: "element",
        prefix: "zv",
        style: "kebab-case",
      },
    ],
    "@angular-eslint/component-class-suffix": "off",
    "@angular-eslint/directive-class-suffix": "off",
    "@angular-eslint/no-input-prefix": [
      "error",
      {
        "prefixes": ["on", "can", "is", "should"]
      }
    ],
    "@angular-eslint/prefer-on-push-component-change-detection": "error",
    "@typescript-eslint/naming-convention": [
      "error",
      {
        "selector": "default",
        "format": ["camelCase"],
        "leadingUnderscore": "allow",
        "trailingUnderscore": "allow"
      },
      {
        "selector": "variable",
        "format": ["camelCase", "UPPER_CASE"],
        "leadingUnderscore": "allow",
        "trailingUnderscore": "allow"
      },
      {
        "selector": "typeLike",
        "format": ["PascalCase"]
      },
      {
        "selector": "objectLiteralProperty",
        "format": null
      }
    ],
    '@typescript-eslint/no-deprecated': 'error',
    "@typescript-eslint/no-empty-function": "off",

    "no-underscore-dangle": "off",
    "object-shorthand": ["error", "never"],
  },
};

module.exports = tseslint.config(
  {
    files: ["**/*.ts"],
    ignores: ["**/*.spec.ts"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: './',
      },
    },
    processor: angular.processInlineTemplates,
    rules: {
      ...baseTsLintConfig.rules,
    },
  },
  {
    files: ["**/*.spec.ts"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: './',
      },
    },
    plugins: {
      jasmine: jasmine,
    },
    processor: angular.processInlineTemplates,
    rules: {
      ...baseTsLintConfig.rules,

      '@typescript-eslint/no-empty-function': 'off', // sometimes necessary, otherwise not that harmful
      '@typescript-eslint/no-explicit-any': 'off', // to much noise :(
      '@typescript-eslint/no-floating-promises': 'off', // to much noise :(
      '@typescript-eslint/no-misused-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'off', // useful, but some false positives
      '@typescript-eslint/no-unsafe-assignment': 'off', // to many errors in existing code, some because @zvoove/components or @angular/components typing is bad
      '@typescript-eslint/no-unsafe-call': 'off', // useful, but some false positives
      '@typescript-eslint/no-unsafe-member-access': 'off', // to many errors in existing code, some because @zvoove/components typing is bad
      '@typescript-eslint/no-unsafe-return': 'off', // useful, but some false positives
      '@typescript-eslint/unbound-method': 'off', // would warn on form validators
      '@typescript-eslint/require-await': 'off',

      "jasmine/expect-single-argument": "error",
      "jasmine/missing-expect": "error",
      "jasmine/no-disabled-tests": "error",
      "jasmine/no-focused-tests": "error",
      "jasmine/no-pending-tests": "error",
      "jasmine/no-promise-without-done-fail": "error",
      "jasmine/no-spec-dupes": "error",
      "jasmine/no-suite-callback-args": "error",
      "jasmine/no-suite-dupes": "error",
      "jasmine/no-unsafe-spy": "error",
      "jasmine/prefer-jasmine-matcher": "error",
      "jasmine/prefer-promise-strategies": "error",
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    rules: {
      "@angular-eslint/template/prefer-control-flow": "error",
    },
  }
);
