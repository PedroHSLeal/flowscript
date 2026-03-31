import { $ } from "bun";
import { args, openInEditor } from "../../utils";

/* const { values, tokens } = args({
  shortcut: { type: "string", short: "s" },
  dockerfile: { type: "boolean", short: "d" },
  edit: { type: "boolean", short: "e" },
  cwd: { type: "string" }
}); */

// const {values: otherValues } = args({ "bare-metal": { type: "string" } });
// console.log(otherValues);

// await openInEditor(values.cwd);
// await $`nvim .`.cwd(values.cwd);

const withImports = await import("./module/with-imports.mjs");
const { default: seila2, anotherExport } = await import("./module/without-imports.mjs");

console.log(Object.keys(withImports));
console.log(seila2);
console.log(anotherExport)