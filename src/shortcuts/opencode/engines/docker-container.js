import { $ } from "bun";
import { prettyPrint, useCmd, usePodmanCLI } from "../../../utils";
import { manageContainers } from "../utils";

const { checkIfArtifactExists } = usePodmanCLI();
const { exec: cmdExec } = useCmd();

export async function runInContainer(flags) {
  const basePath = import.meta.dir.substring(0, import.meta.dir.lastIndexOf("\\"));

  await checkContainerRequirements(basePath);

  const containerRegistry = manageContainers(basePath);

  if (await containerRegistry.exists(flags.cwd)) {
    console.log(prettyPrint("O container já existe :)"));
  }
  else {
    let containerID = await containerRegistry.set(flags.cwd);

    let args = [
      "--interactive",
      "--tty",
      "--env OPENCODE_CONFIG=/opencode/opencode.json",
      `--env OPENROUTER_API_KEY=${process.env.OPENROUTER_API_KEY}`,
      "--network intelligence",
      `--mount type=bind,src=${flags.cwd},dst=/playground`,
      `--name ${containerID}`
    ];

    const proc = cmdExec([`podman run ${args.join(" ")} custom-opencode /bin/bash`]);
    await proc.exited;
  }
}

async function checkContainerRequirements(basePath) {
  if (!(await checkIfArtifactExists("image", false, "library/ubuntu")))
    await $`podman pull docker.io/library/ubuntu:26.04`;
  if (!(await checkIfArtifactExists("image", true, "custom-opencode")))
    await $`podman build --tag custom-opencode .`.cwd(basePath);
  if (!(await checkIfArtifactExists("network", false, "intelligence")))
    await $`podman network create intelligence`;
}