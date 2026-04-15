import { $ } from "bun";

export function usePodmanCLI() {
  async function checkIfArtifactExists(artifact, listAll, shortcut) {
    const artifactList = await $`podman ${artifact} list ${listAll ? "--all" : ""}`.text();
    return artifactList.includes(shortcut);
  }

  async function checkRunningContainers(shortcut) {
    const runningContainers = await $`podman ps`.text();
    return runningContainers.includes(shortcut);
  }

  async function execScriptFileInMachine(shFile, isQuiet = true) {
    let inlineCommands = shFile.split("\n").map(l => l.trim()).filter(l => l.length > 0).filter(l => !l.startsWith("#")).join(" ");
    return $`podman machine ssh '${inlineCommands}'`.quiet(isQuiet);
  }

  async function execInlineCommandInMachine(command, isQuiet = true) {
    return $`podman machine ssh '${command}'`.quiet(isQuiet);
  }

  return {
    checkIfArtifactExists,
    checkRunningContainers,
    execScriptFileInMachine,
    execInlineCommandInMachine
  }
}