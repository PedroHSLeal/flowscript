import { join } from "node:path";
import type { BuiltinWorkflow } from ".";
import { listUserWorkflows } from "../lib/workflows";
import { select } from "../select";

export default {
  usage: "goto [name]",
  description: "pick a workflow and print its folder (use it with the fsgo shell function)",
  async run([name]) {
    const options = (await listUserWorkflows())
      .filter(w => !name || w.name === join(name))
      .map(w => ({ label: `${w.scope.padEnd(6)}  ${w.name}`, value: w.dir }));

    if (options.length === 0) {
      console.error(name ? `Workflow '${name}' does not exist :(` : "You don't have any workflows :(");
      return 1;
    }

    const target = options.length === 1
      ? options[0]!.value
      : await select(name ? `Where is '${name}'?` : "Go to which workflow?", options);

    if (!target) return 1;

    console.log(target);
    return 0;
  },
} satisfies BuiltinWorkflow;
