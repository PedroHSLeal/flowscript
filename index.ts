import { join } from "node:path";
import { getUserConfig } from "./src/utils/user-configs";

const DEFAULT_RUNTIME = "bun";

await main();

async function main() {
  const args = Bun.argv;
  const workflow = Bun.argv[2] as string;

  const { pathToWorkflowFolder } = await getUserConfig();
  const path = join(pathToWorkflowFolder, workflow, "index.mjs");
  const exists = await Bun.file(path).exists();

  if (!exists) {
    console.log(`Workflow '${workflow}' does not exist :(`);
    return;
  }

  await execThroughSpawn(path, args);
}

async function execThroughSpawn(path: string, args: string[]) {
  const spawn = Bun.spawn({
    // cmd: [DEFAULT_RUNTIME, path],
    cmd: [process.execPath, path],
    env: { BUN_BE_BUN: "1" },
    detached: false,
    // ipc(message, subprocess, handle) {},
    ipc: async function (message, subprocess, handle) {
      if (typeof message == "object") {
        const { cmd, throws, quiet } = message;
        // console.log(cmd);
        await Bun.$`${cmd}`.throws(throws).quiet(quiet);
      }
    },
    stdio: ["inherit", "inherit", "inherit"]
  });

  spawn.send(["start", args])

  await spawn.exited;
  spawn.disconnect();
}

async function execThroughModule(path: string, args: string[]) {
  const { mainThroughModule } = await import(path);

  await mainThroughModule(args);
}

async function execThroughCli(path: string, args: string[]) {
  await Bun.$`${process.execPath} run ${path} -- ${args.slice(3)}`
    .env({ BUN_BE_BUN: "1" });
}