import { glob } from "node:fs/promises";
import { homedir } from "node:os";
import { join, sep } from "node:path";

const DEFAULT_WORKFLOW_PATH = join(homedir(), ".config", "flowscript", "workflows");
const CWD_WORKFLOW_PATH = join(process.cwd(), ".flowscript", "workflows");

if (Bun.argv.length == 3 && Bun.argv[2] == "--list-workflows") {
  await listWorkflows();
}
else {
  if (Bun.argv[2] == "--bun-be-bun")
    await startBunBeBun(Bun.argv.slice(3));
  else await startBunBeBun([
    await chooseWorkflowLocation(Bun.argv[2] as string),
    ...Bun.argv.slice(3)
  ]);
}

async function startBunBeBun(cmd: string[]): Promise<void> {
  const subprocess = Bun.spawn({
    cmd: [process.execPath, ...cmd],
    env: { BUN_BE_BUN: "1", ...process.env },
    lazy: true,
    detached: false,
    windowsHide: true,
    windowsVerbatimArguments: false,
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
    console.error(`Workflow '${workflow}' does not exist :(`);
    await listWorkflows();
    process.exit(0);
  }

  return cwdPath && defaultPath;
}

async function listWorkflows() {
  async function list(path: string) {
    const workflows = [];

    for await (const element of glob("**/index.mjs", { cwd: path, exclude: ["**/node_modules/**"] })) {
      workflows.push(element.split(sep)[0]);
      console.log(path + sep + element);
    }

    return workflows;
  }

  return new Set([...await list(DEFAULT_WORKFLOW_PATH), ...await list(CWD_WORKFLOW_PATH)]);
}