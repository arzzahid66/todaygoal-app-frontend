import js from "@eslint/js"
import tseslint from "typescript-eslint"
import next from "eslint-config-next"

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...next,
  {
    ignores: [".next/**", "out/**", "build/**", "node_modules/**"],
  },
]


