module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: "eslint:recommended",
  overrides: [
    {
      env: {
        node: true,
      },
      files: [".eslintrc.{js,cjs}"],
      parserOptions: {
        sourceType: "script",
      },
    },
    {
      files: ["background.js"],
      rules: {
        "no-unused-vars": "off",
      },
    },
    {
      files: ["gmail-script.js"], // Add this override for gmail-script.js
      rules: {
        "no-unused-vars": ["error", { argsIgnorePattern: "^event$" }],
      },
    },
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  globals: {
    chrome: "readonly",
    gptResponse: "writeable",
  },
  rules: {
    indent: ["error", 2],
    quotes: ["error", "double"],
    semi: ["error", "always"],
  },
};
