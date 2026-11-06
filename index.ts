import { glob } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join, sep } from "node:path";
import { select, type SelectOption } from "./select";

const DEFAULT_WORKFLOW_PATH = join(homedir(), ".config", "flowscript", "workflows");
const CWD_WORKFLOW_PATH = join(process.cwd(), ".flowscript", "workflows");

const ARGV = Bun.argv.slice(2);
const INDEX_OF_FS_FLAG = ARGV.findIndex(arg => arg.startsWith("--fs-"));
const FS_FLAG = ARGV[INDEX_OF_FS_FLAG];

switch (FS_FLAG) {
  case undefined:
    await startBunBeBun(ARGV);
    break;
  case "--fs-list":
    const workflows = await listWorkflows();

    console.log(`### Global workflows (${workflows.global.length}):`);
    workflows.global.forEach(w => console.log(`${DEFAULT_WORKFLOW_PATH}${sep}${w}`));

    console.log("");

    console.log(`### Local workflows (${workflows.local.length}):`);
    workflows.local.forEach(w => console.log(`${CWD_WORKFLOW_PATH}${sep}${w}`));
    break;
  case "--fs-workflow":
    const workflow = ARGV[INDEX_OF_FS_FLAG + 1];

    if (!workflow) {
      console.error("Missing workflow name after --fs-workflow");
      process.exit(1);
    }

    const bunArgs = ARGV.slice(0, INDEX_OF_FS_FLAG);
    const workflowArgs = ARGV.slice(INDEX_OF_FS_FLAG + 2);

    const workflowLocation = await chooseWorkflowLocation(workflow);

    await startBunBeBun([
      ...bunArgs,
      workflowLocation,
      ...workflowArgs
    ]);
    break;
  case "--fs-goto":
    const name = ARGV[INDEX_OF_FS_FLAG + 1];
    const { global, local } = await listWorkflows();

    const options: SelectOption<string>[] = [
      ...global.map(w => ({ scope: "global", name: dirname(w), dir: join(DEFAULT_WORKFLOW_PATH, dirname(w)) })),
      ...local.map(w => ({ scope: "local ", name: dirname(w), dir: join(CWD_WORKFLOW_PATH, dirname(w)) }))
    ]
      .filter(w => !name || w.name === join(name))
      .map(w => ({ label: `${w.scope}  ${w.name}`, value: w.dir }));

    if (options.length === 0) {
      console.error(name ? `Workflow '${name}' does not exist :(` : "You don't have any workflows :(");
      process.exit(1);
    }

    const target = options.length === 1
      ? options[0]!.value
      : await select(name ? `Where is '${name}'?` : "Go to which workflow?", options);

    if (!target) process.exit(1);

    console.log(target);
    break;

  default:
    console.error(`Unknown flowscript flag '${FS_FLAG}'. Available: --fs-list, --fs-workflow, --fs-goto`);
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

  return cwdExists ? cwdPath : defaultPath;
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