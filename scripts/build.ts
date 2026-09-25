import { name } from "../package.json";

await Bun.build({
  entrypoints: ["./index.ts"],
  outdir: ".",
  target: "bun",
  metafile: true,
  compile: {
    outfile: name,
    autoloadPackageJson: true,
    autoloadDotenv: true,
    autoloadTsconfig: true,
    autoloadBunfig: true,
  },
});