import { $ } from "bun";
import { prettyPrint, useCmd, usePodmanCLI } from "../../../utils";
import { manageContainers } from "../utils";

const { checkIfArtifactExists } = usePodmanCLI();
const { exec: cmdExec } = useCmd();

export async function runInContainer(flags, singleMode) {
  const basePath = import.meta.dir.substring(0, import.meta.dir.lastIndexOf("\\"));

  await checkContainerRequirements(basePath);

  const containerRegistry = manageContainers(basePath);

  let containerID = null;
  if (singleMode) {
    containerID = "ire-opencode";
    const fun = "C:\\Users\\henri\\fun";

    if (fun === flags.cwd) {
      console.log(prettyPrint("O diretório aonde voce se encontra é o mesmo do modo --single. Cuidado!!!"));
      return;
    }

    let args = [
      "--detach",
      "--interactive",
      "--tty",
      "--rm",
      "--env OPENCODE_CONFIG=/opencode/opencode.json",
      `--env OPENROUTER_API_KEY=${process.env.OPENROUTER_API_KEY}`,
      "--network intelligence",
      `--mount type=bind,src=${fun},dst=/playground`,
      `--name ${containerID}`
    ];


    if (await checkIfArtifactExists("container", true, containerID)) {
      const startProc = cmdExec([`podman start ${containerID}`]);
      await startProc.exited;
    }
    else {
      const runProc = cmdExec([`podman run ${args.join(" ")} custom-opencode`]);
      await runProc.exited;
    }

    let restPath = flags.cwd.replace(fun, "").replace(/\\/g, "/");
    const execProc = cmdExec([`podman exec --interactive --tty --workdir /playground/${restPath} ${containerID} bash`]);
    await execProc.exited;
  }
  else {
    if (await containerRegistry.exists(flags.cwd)) {
      containerID = await containerRegistry.get(flags.cwd);
    }
    else {
      containerID = await containerRegistry.set(flags.cwd);
    }

    if (await checkIfArtifactExists("container", true, containerID)) {
      const startProc = cmdExec([`podman start ${containerID}`]);
      await startProc.exited;
    }
    else {
      let args = [
        "--interactive",
        "--tty",
        "--env OPENCODE_CONFIG=/opencode/opencode.json",
        `--env OPENROUTER_API_KEY=${process.env.OPENROUTER_API_KEY}`,
        "--network intelligence",
        `--mount type=bind,src=${flags.cwd},dst=/playground`,
        `--name ${containerID}`
      ];

      const proc = cmdExec([`podman run ${args.join(" ")} custom-opencode bash`]);
      await proc.exited;
    }
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