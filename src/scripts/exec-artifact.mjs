import { $ } from "bun";
import { args } from "../utils";

await main();

async function main() {
  const argv = Bun.argv;

  const { values } = args({
    artifact: { type: "string", short: "a" },
    cwd: { type: "string" }
  }, argv);

  if (!values.shortcut) {
    console.log("(--artifact | -a) é obrigatório");
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