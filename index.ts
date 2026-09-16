import { join } from "node:path";
import { getUserConfig } from "./src/utils/user-configs";
import { parseArgs } from "node:util";

const { values } = parseArgs({
  args: Bun.argv,
  options: {
    cwd: { type: "boolean", default: false }
  }
})

const entrypoint = Bun.argv[2];

await startWorkflow(entrypoint);

async function startWorkflow(workflow: string | undefined) {
  if (!workflow) {
    console.error(`the workflow prop is required`);
    return;
  }

  const { pathToWorkflowFolder } = await getUserConfig();
  const path = join(values.cwd ? process.cwd() : pathToWorkflowFolder, workflow, "index.mjs");
  const exists = await Bun.file(path).exists();

  if (!exists) {
    console.log(`Workflow '${workflow}' does not exist :(`);
    return;
  }

  const { default: program } = await import(path);

  await program(Bun.argv);
}