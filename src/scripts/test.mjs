import { $ } from "bun";
import { args, openInEditor } from "../utils";

const { values, tokens } = args({
  shortcut: { type: "string", short: "s" },
  dockerfile: { type: "boolean", short: "d" },
  edit: { type: "boolean", short: "e" },
  cwd: { type: "string" }
});

// console.log(tokens);

const {values: otherValues } = args({ "bare-metal": { type: "string" } });

console.log(otherValues);

// await openInEditor(values.cwd);
// await $`nvim .`.cwd(values.cwd);
