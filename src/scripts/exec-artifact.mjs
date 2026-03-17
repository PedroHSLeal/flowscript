import { $ } from "bun";
import { args, usePodman } from "../utils";

const { execScriptFileInMachine } = usePodman();

await main();

async function main() {
  const argv = Bun.argv;

  const { values } = args({
    shortcut: { type: "string", short: "s" },
    cwd: { type: "string" }
  }, argv);

  if (!values.shortcut) {
    console.log("(--shortcut | -s) é obrigatório");
    return;
  }

  const subprocess = Bun.spawn(["bun", `${process.cwd()}\\src\\shortcuts\\${values.shortcut}\\exec.mjs`], {
    ipc: (message, subprocess, handle) => { },
    detached: false,
    stdio: ["inherit", "inherit", "inherit"]
  });

  subprocess.send({ flags: values, argv });
  await subprocess.exited;

  subprocess.disconnect();
}