import { $ } from "bun";
import { parseArgs } from "util";
import { select } from "@inquirer/prompts";
import { spawn } from "node:child_process";

export function useDockerHub() {
  async function fetchDockerHubImageRegistry(shortcut) {
    const payload = await $`curl https://hub.docker.com/search.data?q=${shortcut}`.json();
    return {
      totalResults: payload[payload.indexOf("total") + 1],
      ids: payload.filter(p => typeof p == "string").filter(p => p.endsWith(`/${shortcut}`))
    };
  }

  async function selectRegistry(ids) {
    return await select({
      loop: false,
      message: "qual imagem tu quer baixar?: ",
      choices: ids.map(i => ({ name: i, value: i, description: "" }))
    });
  }

  async function pullImageFromDockerHub(imageName) {
    const imageExists = await checkIfArtifactExists("image", imageName);
    if (!imageExists) {
      await $`podman pull docker.io/${imageName}`;
    }
  }

  return {
    fetchDockerHubImageRegistry,
    selectRegistry,
    pullImageFromDockerHub
  }
}

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

export function args(flags) {
  return parseArgs({
    args: Bun.argv,
    options: flags,
    strict: false,
    allowNegative: true,
    allowPositionals: true,
    tokens: true
  });
}

export async function execInteractiveCommand(command) {
  const options = {
    windowsHide: false,
    windowsVerbatimArguments: true,
    detached: false,
    stdio: ["inherit", "inherit", "inherit"]
  };

  return Bun.spawn({ cmd: ["cmd", "/C", command], ...options });
}