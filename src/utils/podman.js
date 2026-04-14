import { $ } from "bun";

export function usePodman() {
  async function checkIfArtifactExists(artifact, shortcut) {
    const artifactList = await $`podman ${artifact} list`.text();
    return artifactList.includes(shortcut);
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
    execScriptFileInMachine,
    execInlineCommandInMachine
  }
}