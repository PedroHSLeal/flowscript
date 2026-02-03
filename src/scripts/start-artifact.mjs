import { $ } from "bun";
import { args, checkIfArtifactExists, useDockerHub } from "../utils";

const { fetchDockerHubImageRegistry, selectRegistry, pullImageFromDockerHub } = useDockerHub();

await main();

async function main() {
  const { values } = args({
    shortcut: { type: "string" },
    dockerfile: { type: "boolean" },
    edit: { type: "boolean" },
    cwd: { type: "string" }
  });

  if (!values.shortcut) {
    console.log("--shortcut é obrigatório");
    return;
  }

  await checkIfPodmanIsOn();

  const containerExists = await checkIfArtifactExists("image", values.shortcut);

  if (!containerExists) {
    const data = await fetchDockerHubImageRegistry(values.shortcut);
    const imageName = await selectRegistry(data.ids);

    await pullImageFromDockerHub(imageName);
  }

  execute(values).then(() => {
    const subprocess = Bun.spawn(["bun", `${process.cwd()}\\src\\shortcuts\\${values.shortcut}\\index.mjs`], {
      ipc: (message, subprocess, handle) => {
      },
      // windowsHide: true,
      detached: false,
      stdio: ["inherit", "inherit", "inherit"]
    });

    subprocess.send(values);
  });
}

async function checkIfPodmanIsOn() {
  try {
    await $`podman ps`.quiet();
  } catch (err) {
    await $`podman machine start`.quiet();
  }
}

async function execute({ shortcut, dockerfile }) {
  const outputList = await $`ls -l $(pwd)\\src\\shortcuts`.text();

  if (!outputList.includes(shortcut)) {
    console.log(`o shortcut '${shortcut}' nao existe :(`);
    console.log(`vou criar agora!`);

    await $`mkdir $(pwd)\\src\\shortcuts\\${shortcut}`;
    await $`touch $(pwd)\\src\\shortcuts\\${shortcut}\\index.mjs`;

    if (dockerfile)
      await $`touch $(pwd)\\src\\shortcuts\\${shortcut}\\Dockerfile`;
  }
}
