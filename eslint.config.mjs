import importLint from "eslint-plugin-import";
import jsLint from "@eslint/js";
import tsLint from "typescript-eslint";
import tsParser from "@typescript-eslint/parser";
import prettierConfig from "eslint-plugin-prettier/recommended";
import eslintPluginReact from "eslint-plugin-react";
import eslintPluginReactHooks from "eslint-plugin-react-hooks";
import { fixupConfigRules } from "@eslint/compat";
import globals from "globals";

eslintPluginReactHooks.configs.recommended.plugins = {
  "react-hooks": eslintPluginReactHooks,
};

export default [
  jsLint.configs.recommended,
  ...fixupConfigRules(tsLint.configs.recommended),
  ...fixupConfigRules(eslintPluginReact.configs.flat.recommended),
  ...fixupConfigRules(importLint.flatConfigs.recommended),
  ...fixupConfigRules(importLint.flatConfigs.typescript),
  ...fixupConfigRules(eslintPluginReactHooks.configs.recommended),
  ...fixupConfigRules(prettierConfig),
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,jsx,tsx}"],
    plugins: {},

    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2022,
      sourceType: "module",

      globals: {
        ...globals.browser,
      },

      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },

        project: ["./tsconfig.json"],
      },
    },

    settings: {
      react: {
        version: "detect",
      },
    },

    rules: {
      "no-console": "off",
      "no-debugger": "warn",
      "no-eval": "error",
      "import/first": "error",
      "import/no-named-as-default-member": "off",
      "import/no-named-as-default": "off",
      "import/no-unresolved": "off",
      "prettier/prettier": "warn",
      "react/prop-types": "off",
      "@typescript-eslint/no-redundant-type-constituents": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "@typescript-eslint/no-misused-promises": [
        "error",
        {
          checksVoidReturn: {
            arguments: false,
            attributes: false,
            properties: false,
          },
        },
      ],
    },
  },
];
