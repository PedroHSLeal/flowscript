import { join } from "node:path";
import { homedir } from "node:os";
import { exists, mkdir, readFile, writeFile } from "node:fs/promises";

const CONFIG_NAME = "config.json";
const CONFIG_FOLDER = join(homedir(), "\\.config\\flowscript");
const CONFIG_PATH = join(homedir(), "\\.config\\flowscript", CONFIG_NAME);

const DEFAULT_LOCATION_WORKFLOW = join(homedir(), "\\.config\\flowscript\\workflows");

type UserConfigs = {
  pathToWorkflowFolder?: string;
}

async function get() {
  return JSON.parse(await readFile(CONFIG_PATH, { encoding: "utf8" })) as UserConfigs;
}

async function set(newConfig: string) {
  await mkdir(CONFIG_FOLDER, { recursive: true })
  await writeFile(CONFIG_PATH, newConfig, { encoding: "utf8" });
}

async function checkIfConfigExists() {
  if (!(await exists(CONFIG_PATH))) await setUserConfig({});
}

export async function getUserConfig(): Promise<Required<UserConfigs>> {
  await checkIfConfigExists();

  const base = await get();

  await checkLocationToWorkflows(base.pathToWorkflowFolder);

  return {
    pathToWorkflowFolder: base.pathToWorkflowFolder ?? DEFAULT_LOCATION_WORKFLOW
  }
}

export async function setUserConfig(newConfig: UserConfigs) {
  return set(JSON.stringify(newConfig));
}

async function checkLocationToWorkflows(location: string | undefined) {
  if (location && !(await exists(location))) await mkdir(location, { recursive: true });
  if (!(await exists(DEFAULT_LOCATION_WORKFLOW))) await mkdir(DEFAULT_LOCATION_WORKFLOW, { recursive: true });
}