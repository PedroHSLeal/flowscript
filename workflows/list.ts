import { BUILTIN_WORKFLOWS, type BuiltinWorkflow } from ".";
import { GLOBAL_WORKFLOW_PATH, LOCAL_WORKFLOW_PATH, listUserWorkflows } from "../lib/workflows";

export default {
  usage: "list",
  description: "list the local, global and built-in workflows",
  async run() {
    const workflows = await listUserWorkflows();
    const local = workflows.filter(w => w.scope === "local");
    const global = workflows.filter(w => w.scope === "global");

    console.log(`### Local workflows (${local.length}) in ${LOCAL_WORKFLOW_PATH}:`);
    local.forEach(w => console.log(w.entry));
    console.log("");
    console.log(`### Global workflows (${global.length}) in ${GLOBAL_WORKFLOW_PATH}:`);
    global.forEach(w => console.log(w.entry));
    console.log("");
    console.log(`### Built-in workflows (${Object.keys(BUILTIN_WORKFLOWS).length}):`);
    Object.keys(BUILTIN_WORKFLOWS).forEach(name => console.log(name));

    return 0;
  },
} satisfies BuiltinWorkflow;
