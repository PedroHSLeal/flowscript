import { BUILTIN_WORKFLOWS, type BuiltinWorkflow } from ".";
import { PREFIX } from "../cli";

export default {
  usage: "help",
  description: "show this help",
  async run() {
    const rows: [string, string][] = [
      [`${PREFIX}workflow <name> [...args]`, "run a workflow (bun flags can come before it)"],
      ...Object.values(BUILTIN_WORKFLOWS).map((w): [string, string] => [`${PREFIX}workflow ${w.usage}`, w.description]),
      ["[...bun-args]", "anything else is passed to bun"],
    ];
    const width = Math.max(...rows.map(([usage]) => usage.length));

    console.log(["Usage:", ...rows.map(([usage, description]) => `  flowscript ${usage.padEnd(width)}  ${description}`)].join("\n"));
    return 0;
  },
} satisfies BuiltinWorkflow;
