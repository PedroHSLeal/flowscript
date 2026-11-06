import { glob } from "node:fs/promises";
import { homedir } from "node:os";
import { join, sep } from "node:path";

const DEFAULT_WORKFLOW_PATH = join(homedir(), ".config", "flowscript", "workflows");
const CWD_WORKFLOW_PATH = join(process.cwd(), ".flowscript", "workflows");

const ENTRYPOINT = Bun.argv[2];

switch (ENTRYPOINT) {
  case "--bun-be-bun":
    await startBunBeBun(Bun.argv.slice(3));
    break;
  case "--list-workflows":
    const workflows = await listWorkflows();

    console.log(`### Global workflows (${workflows.global.length}):`);
    workflows.global.forEach(w => console.log(`${DEFAULT_WORKFLOW_PATH}${sep}${w}`));

    console.log("");

    console.log(`### Local workflows (${workflows.local.length}):`);
    workflows.local.forEach(w => console.log(`${CWD_WORKFLOW_PATH}${sep}${w}`));
    break;
  default:
    const indexOfWorkflow = Bun.argv.indexOf("--workflow");
    const workflow = Bun.argv[indexOfWorkflow + 1] as string;

    let bunArgs = Bun.argv.slice(2, indexOfWorkflow);
    let workflowArgs = Bun.argv.slice(indexOfWorkflow + 2, Bun.argv.length);

    const workflowLocation = await chooseWorkflowLocation(workflow);

    await startBunBeBun([
      ...bunArgs,
      workflowLocation,
      ...workflowArgs
    ]);
    break;
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

  await subprocess.exited;
}

async function chooseWorkflowLocation(workflow: string) {
  const defaultPath = join(DEFAULT_WORKFLOW_PATH, workflow, "index.mjs");
  const defaultExists = await Bun.file(defaultPath).exists();
  const cwdPath = join(CWD_WORKFLOW_PATH, workflow, "index.mjs");
  const cwdExists = await Bun.file(cwdPath).exists();

  if (!cwdExists && !defaultExists) {
    const workflows = await listWorkflows();

    console.error(`Workflow '${workflow}' does not exist :(`);
    console.log(`you have ${workflows.global.length + workflows.local.length} workflows:`);

    workflows.global.forEach(w => console.log("- " + w));
    workflows.local.forEach(w => console.log("- " + w));

    process.exit(0);
  }

  return cwdPath && defaultPath;
}

async function listWorkflows() {
  async function list(path: string) {
    const workflows = [];

    for await (const element of glob("**/index.mjs", { cwd: path, exclude: ["**/node_modules/**"] })) {
      workflows.push(element);
    }

    return workflows;
  }

  return { global: await list(DEFAULT_WORKFLOW_PATH), local: await list(CWD_WORKFLOW_PATH) };
}