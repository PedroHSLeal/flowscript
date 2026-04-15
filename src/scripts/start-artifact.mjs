import { $ } from "bun";
import { args, usePodman } from "../utils";

import shEntrypoint from "./ssh-entrypoint.sh" with { type: "text" };

const { execScriptFileInMachine } = usePodman();

await main();

async function main() {
  const argv = Bun.argv;

  const flags = args({
    artifact: { type: "string", short: "a" },
    cwd: { type: "string" }
  }, {}, argv);

  if (!flags.artifact) {
    console.log("(--artifact | -a) é obrigatório");
    return;
  }

  await checkIfPodmanIsOn();
  await execScriptFileInMachine(shEntrypoint, true);

  const exists = await Bun.file(`${process.cwd()}\\src\\shortcuts\\${flags.artifact}\\index.mjs`).exists();

  if (exists) {
    const { default: main } = await import(`${process.cwd()}\\src\\shortcuts\\${flags.artifact}\\index.mjs`);

    if (main) await main(flags, argv);
    else await startSubprocess(flags, argv)
  }
  else console.log(`O artifact ${flags.artifact} nao existe :(`);
}

async function checkIfPodmanIsOn() {
  try {
    await $`podman ps`.quiet();
  } catch (err) {
    await $`podman machine start`.quiet();
  }

  console.log("Podman VM está de pé!");
}

async function startSubprocess(flags, argv) {
  const subprocess = Bun.spawn(["bun", `${process.cwd()}\\src\\shortcuts\\${flags.artifact}\\index.mjs`], {
    ipc: (message, subprocess, handle) => { },
    detached: false,
    stdio: ["inherit", "inherit", "inherit"]
  });

  subprocess.send({ flags, argv });
  await subprocess.exited;

  subprocess.disconnect();
}