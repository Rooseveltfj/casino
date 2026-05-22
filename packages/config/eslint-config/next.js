// @ts-check
const { resolve } = require("node:path");

const project = resolve(process.cwd(), "tsconfig.json");

/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [require.resolve("./index.js"), "next/core-web-vitals"],
  parserOptions: {
    project,
  },
  rules: {
    "@next/next/no-html-link-for-pages": "error",
  },
};
