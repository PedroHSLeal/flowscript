import { name } from "../package.json";

await Bun.build({
  entrypoints: ["./index.ts"],
  outdir: ".",
  target: "bun",
  compile: {
    outfile: name,
  }
});