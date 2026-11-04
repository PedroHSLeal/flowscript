import { glob, stat } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join, sep } from "node:path";

const DEFAULT_WORKFLOW_PATH = join(homedir(), ".config", "flowscript", "workflows");
const CWD_WORKFLOW_PATH = join(process.cwd(), ".flowscript", "workflows");

type WorkflowScope = "project" | "global";

type Workflow = {
  name: string;
  path: string;
  scope: WorkflowScope;
};

type WorkflowEndpoint = {
  scope: WorkflowScope;
  path: string;
  exists: boolean;
  workflows: Workflow[];
};

const command = Bun.argv[2];

if (command == "list" || command == "--list-workflows") {
  await printWorkflows();
}
else if (command == "--bun-be-bun") {
  await startBunBeBun(Bun.argv.slice(3));
}
else if (Bun.argv.includes("--workflow")) {
  const indexOfWorkflow = Bun.argv.indexOf("--workflow");
  const workflow = Bun.argv[indexOfWorkflow + 1] as string;

  let bunArgs = Bun.argv.slice(2, indexOfWorkflow);
  let workflowArgs = Bun.argv.slice(indexOfWorkflow + 2, Bun.argv.length);

  const workflowLocation = await chooseWorkflowLocation(workflow);

  /* if (!bunArgs.includes("--cwd")) {
    bunArgs.push("--cwd");
    bunArgs.push(workflowLocation.replace(`${sep}${workflow}${sep}index.mjs`, ""));
  } */

  /* bunArgs = bunArgs.reduce((prev: any[], curr: string) => {
    if (curr.startsWith("--")) prev.push([curr]);
    else prev[prev.length - 1] = `${prev[prev.length - 1]}=${curr}`;
    return prev;
  }, []); */

  await startBunBeBun([
    ...bunArgs,
    workflowLocation,
    ...workflowArgs
  ]);
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
    console.log(`you have ${workflows.length} workflows:`);

    workflows.forEach(w => console.log(`- ${w.name} (${w.scope})`));

    process.exit(0);
  }

  return cwdPath && defaultPath;
}

async function directoryExists(path: string): Promise<boolean> {
  try {
    return (await stat(path)).isDirectory();
  }
  catch {
    return false;
  }
}

/* every place flowscript looks for workflows, in resolution order:
   a workflow of the project shadows a global one with the same name */
async function listWorkflowEndpoints(): Promise<WorkflowEndpoint[]> {
  async function list(path: string, scope: WorkflowScope) {
    const workflows: Workflow[] = [];

    for await (const element of glob("**/index.mjs", { cwd: path, exclude: ["**/node_modules/**"] })) {
      const name = dirname(element).split(sep).join("/");

      /* an index.mjs sitting right on the endpoint has no name,
         so there is no way to reach it with --workflow */
      if (name == ".") continue;

      workflows.push({
        name,
        path: join(path, element),
        scope
      });
    }

    return workflows.sort((a, b) => a.name.localeCompare(b.name));
  }

  return [
    {
      scope: "project",
      path: CWD_WORKFLOW_PATH,
      exists: await directoryExists(CWD_WORKFLOW_PATH),
      workflows: await list(CWD_WORKFLOW_PATH, "project")
    },
    {
      scope: "global",
      path: DEFAULT_WORKFLOW_PATH,
      exists: await directoryExists(DEFAULT_WORKFLOW_PATH),
      workflows: await list(DEFAULT_WORKFLOW_PATH, "global")
    }
  ];
}

async function listWorkflows(): Promise<Workflow[]> {
  const endpoints = await listWorkflowEndpoints();

  return endpoints.flatMap(endpoint => endpoint.workflows);
}

async function printWorkflows(): Promise<void> {
  const endpoints = await listWorkflowEndpoints();
  const total = endpoints.reduce((count, endpoint) => count + endpoint.workflows.length, 0);
  const shadowing = endpoints.find(endpoint => endpoint.scope == "project")?.workflows.map(w => w.name) ?? [];

  console.log("flowscript workflows\n");

  for (const endpoint of endpoints) {
    const label = endpoint.scope == "project" ? "project" : "global ";

    console.log(`${label}  ${endpoint.path}${endpoint.exists ? "" : "  (path not found)"}`);

    if (endpoint.workflows.length == 0) {
      console.log("          no workflows here\n");
      continue;
    }

    const width = Math.max(...endpoint.workflows.map(w => w.name.length));

    for (const workflow of endpoint.workflows) {
      const overridden = endpoint.scope == "global" && shadowing.includes(workflow.name);

      console.log(`  ${workflow.name.padEnd(width)}  ${workflow.path}${overridden ? "  (overridden by project)" : ""}`);
    }

    console.log("");
  }

  console.log(`${total} ${total == 1 ? "workflow" : "workflows"} found, run one with: flowscript --workflow <name>`);
}
