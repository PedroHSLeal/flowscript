import { $ } from "bun";
import { args, usePodman } from "../utils";

import shEntrypoint from "./ssh-entrypoint.sh" with { type: "text" };

const { execScriptFileInMachine } = usePodman();

await main();

async function main() {
  const argv = Bun.argv;

  const { values, tokens } = args({
    shortcut: { type: "string", short: "s" },
    dockerfile: { type: "boolean", short: "d" },
    edit: { type: "boolean", short: "e" },
    cwd: { type: "string" }
  }, argv);

  if (!values.shortcut) {
    console.log("(--shortcut | -s) é obrigatório");
    return;
  }

  await checkIfPodmanIsOn();
  await execScriptFileInMachine(shEntrypoint);
  await execute(values);

  const exists = await Bun.file(`${process.cwd()}\\src\\shortcuts\\${values.shortcut}\\index.mjs`).exists();

  if (exists) await startSubprocess(values, argv);
  else {
    const { default: main } = await import(`${process.cwd()}\\src\\shortcuts\\${values.shortcut}\\main.mjs`);
    await main(values, argv);
  }
}

async function checkIfPodmanIsOn() {
  try {
    await $`podman ps`.quiet();
  } catch (err) {
    await $`podman machine start`.quiet();
    console.log("Podman VM está de pé!");
  }
}

async function execute({ shortcut }) {
  const outputList = await $`ls -l $(pwd)\\src\\shortcuts`.text();

  if (!outputList.includes(shortcut)) {
    console.log(`o shortcut '${shortcut}' nao existe :(... vou criar agora!`);

    await $`mkdir $(pwd)\\src\\shortcuts\\${shortcut}`;
    await $`touch $(pwd)\\src\\shortcuts\\${shortcut}\\index.mjs`;
    await $`touch $(pwd)\\src\\shortcuts\\${shortcut}\\Dockerfile`;
  }
}

async function startSubprocess(values, argv) {
  const subprocess = Bun.spawn(["bun", `${process.cwd()}\\src\\shortcuts\\${values.shortcut}\\index.mjs`], {
    ipc: (message, subprocess, handle) => { },
    detached: false,
    stdio: ["inherit", "inherit", "inherit"]
  });

  subprocess.send({ flags: values, argv });
  await subprocess.exited;

  subprocess.disconnect();
}