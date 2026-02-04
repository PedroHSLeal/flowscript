import { $ } from "bun";
import { args, usePodman } from "../utils";

import shEntrypoint from "./ssh-entrypoint.sh" with { type: "text" };

const { execScriptFileInMachine } = usePodman();

await main();

async function main() {
  const { values } = args({
    shortcut: { type: "string", short: "s" },
    dockerfile: { type: "boolean", short: "d" },
    edit: { type: "boolean" },
    cwd: { type: "string" }
  });

  if (!values.shortcut) {
    console.log("--shortcut é obrigatório");
    return;
  }

  await checkIfPodmanIsOn();
  await execScriptFileInMachine(shEntrypoint);

  execute(values).then(async () => {
    const subprocess = Bun.spawn(["bun", `${process.cwd()}\\src\\shortcuts\\${values.shortcut}\\index.mjs`], {
      ipc: (message, subprocess, handle) => { },
      detached: false,
      stdio: ["inherit", "inherit", "inherit"]
    });

    subprocess.send(values);
    await subprocess.exited;

    subprocess.disconnect();
  });
}

async function checkIfPodmanIsOn() {
  try {
    await $`podman ps`.quiet();
  } catch (err) {
    await $`podman machine start`.quiet();
  }

  console.log("Podman VM está de pé!");
}

async function execute({ shortcut, dockerfile }) {
  const outputList = await $`ls -l $(pwd)\\src\\shortcuts`.text();

  if (!outputList.includes(shortcut)) {
    console.log(`o shortcut '${shortcut}' nao existe :(... vou criar agora!`);

    await $`mkdir $(pwd)\\src\\shortcuts\\${shortcut}`;
    await $`touch $(pwd)\\src\\shortcuts\\${shortcut}\\index.mjs`;

    if (dockerfile)
      await $`touch $(pwd)\\src\\shortcuts\\${shortcut}\\Dockerfile`;
  }
}
