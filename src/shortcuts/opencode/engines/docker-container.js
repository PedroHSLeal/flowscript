import { $ } from "bun";
import { getFolderName, hash, useCmd, usePodmanCLI, symbolinkLinkOps } from "../../../utils";
import { manageContainers } from "../utils";

const { checkIfArtifactExists } = usePodmanCLI();
const { exec: cmdExec } = useCmd();
const { addLink } = symbolinkLinkOps();

export async function runInContainer(flags) {
  await $`mkdir opencode`.cwd("C:\\Users\\henri\\fun\\shenanigans").quiet().nothrow();

  const folderName = getFolderName(flags.cwd);
  const opencodeSrc = "C:\\Users\\henri\\fun\\shenanigans\\opencode";
  const basePath = import.meta.dir.substring(0, import.meta.dir.lastIndexOf("\\"));

  await checkContainerRequirements(basePath);

  const containerRegistry = manageContainers(basePath);
  const registryDb = await containerRegistry.read();

  let uniqueFolderID = null;
  if (await containerRegistry.exists(registryDb, flags.cwd)) {
    uniqueFolderID = await containerRegistry.get(registryDb, flags.cwd).id;
  }
  else {
    uniqueFolderID = hash(flags.cwd);
    await addLink(`${opencodeSrc}\\${uniqueFolderID}`, flags.cwd);
  }

  await containerRegistry.register(registryDb, uniqueFolderID, flags.cwd, folderName);

  await startNewContainer(opencodeSrc);

  if (await checkIfArtifactExists("container", false, "custom-opencode")) {
    await attachNewProcess();
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

async function startNewContainer(opencodeSrc) {
  let args = [
    "--detach",
    "--interactive",
    "--tty",
    "--env OPENCODE_CONFIG=/opencode/opencode.json",
    `--env OPENROUTER_API_KEY=${process.env.OPENROUTER_API_KEY}`,
    "--network intelligence",
    `--mount type=bind,src=${opencodeSrc},dst=/playground`,
    `--name custom-opencode`
  ];

  const proc = cmdExec([`podman run ${args.join(" ")} custom-opencode /bin/bash`]);
  await proc.exited;
}

async function attachNewProcess() {
  const execContainer = cmdExec([`podman exec --interactive --tty custom-opencode /bin/bash`]);
  await execContainer.exited;
}