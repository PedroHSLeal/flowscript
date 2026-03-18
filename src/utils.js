import { $ } from "bun";
import { parseArgs } from "util";

export function useDockerfile() {
  async function checkIfDockerfileExists(filePath) {
    return Bun.file(filePath).exists();
  }

  return {
    checkIfDockerfileExists
  }
}

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

export function args(flags, options = {}, args = Bun.argv) {
  let restOptions = {
    ... {
      strict: false,
      allownegative: true,
      allowpositionals: true,
      tokens: true
    },
    ...options
  };

  return parseArgs({
    args,
    options: flags,
    ...restOptions
  });
}

export async function execInteractiveCommand(command, envs = {}) {
  const options = {
    env: envs,
    windowsHide: false,
    windowsVerbatimArguments: true,
    detached: false,
    stdio: ["inherit", "inherit", "inherit"]
  };

  return Bun.spawn({ cmd: ["cmd", "/C", command], ...options });
}

export async function openInEditor(cwd) {
  await $`code --wait .`.cwd(cwd);
}