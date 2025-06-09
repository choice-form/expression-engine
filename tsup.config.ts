import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  target: "es2022",
  outDir: "dist",
  dts: true,
  sourcemap: true,
  clean: true,
  minify: false,
  splitting: false,
  external: ["luxon", "jmespath"],
  noExternal: [],
  banner: {
    js: "// Expression Engine - High-performance safe template evaluator",
  },
  esbuildOptions(options) {
    options.charset = "utf8"
  },
})
