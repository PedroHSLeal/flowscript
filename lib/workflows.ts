import { glob } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

export const GLOBAL_WORKFLOW_PATH = join(homedir(), ".config", "flowscript", "workflows");
export const LOCAL_WORKFLOW_PATH = join(process.cwd(), ".flowscript", "workflows");

export type Scope = "local" | "global";
export type UserWorkflow = { scope: Scope; name: string; dir: string; entry: string };

async function list(scope: Scope, root: string): Promise<UserWorkflow[]> {
  const workflows: UserWorkflow[] = [];

  for await (const entry of glob("**/index.mjs", { cwd: root, exclude: ["**/node_modules/**"] })) {
    const name = dirname(entry);
    workflows.push({ scope, name, dir: join(root, name), entry: join(root, entry) });
  }

  return workflows;
}

// the user's workflows, local first
export async function listUserWorkflows(): Promise<UserWorkflow[]> {
  return [...await list("local", LOCAL_WORKFLOW_PATH), ...await list("global", GLOBAL_WORKFLOW_PATH)];
}

// the entry file of a user workflow; local wins over global
export async function findUserWorkflow(name: string): Promise<string | undefined> {
  for (const root of [LOCAL_WORKFLOW_PATH, GLOBAL_WORKFLOW_PATH]) {
    const entry = join(root, name, "index.mjs");
    if (await Bun.file(entry).exists()) return entry;
  }

  return undefined;
}
