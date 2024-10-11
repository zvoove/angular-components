// @ts-check
const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");
const jasmine = require("eslint-plugin-jasmine");

module.exports = tseslint.config(
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    plugins: {
      jasmine: jasmine,
    },
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/prefer-standalone": "error",
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
      "@typescript-eslint/no-empty-function": "off",
      "no-underscore-dangle": "off",
      "object-shorthand": ["error", "never"],
      "prefer-arrow/prefer-arrow-functions": "off",

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
