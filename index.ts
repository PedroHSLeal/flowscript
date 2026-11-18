import { parseArgs, PREFIX } from "./cli";
import { findUserWorkflow, listUserWorkflows } from "./lib/workflows";
import { BUILTIN_WORKFLOWS } from "./workflows";

const invocation = parseArgs(Bun.argv.slice(2));

switch (invocation.kind) {
  case "bun":
    await startBunBeBun(invocation.args);
    break;

  case "workflow":
    await runWorkflow(invocation.name, invocation.bunArgs, invocation.args);
    break;

  case "error":
    console.error(invocation.message);
    process.exit(1);
}

// user workflows (local, then global) win over the built-in ones
async function runWorkflow(name: string, bunArgs: string[], args: string[]) {
  const entry = await findUserWorkflow(name);

  if (entry) return startBunBeBun([...bunArgs, entry, ...args]);

  const builtin = BUILTIN_WORKFLOWS[name];

  if (builtin) {
    process.exitCode = await builtin.run(args);
    return;
  }

  const available = [...(await listUserWorkflows()).map(w => w.name), ...Object.keys(BUILTIN_WORKFLOWS)];

  console.error(`Workflow '${name}' does not exist :(`);
  console.error(`you have ${available.length} workflows (see '${PREFIX}workflow list'):`);
  [...new Set(available)].forEach(w => console.error("- " + w));
  process.exit(1);
}

async function startBunBeBun(cmds: string[]): Promise<void> {
  const subprocess = Bun.spawn({
    cmd: [process.execPath, ...cmds],
    env: { BUN_BE_BUN: "1", ...process.env },
    lazy: true,
    detached: false,
    windowsHide: true,
    windowsVerbatimArguments: false,
    ipc(message, subprocess, handle) { },
    stdio: ["inherit", "inherit", "inherit"]
  });

  // exit with the same code as bun/the workflow, so failures reach the caller
  process.exitCode = await subprocess.exited;
}
