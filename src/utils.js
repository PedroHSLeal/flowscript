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

export function usePodmanMachine() {
  async function execScriptFile(shFile) {
    let inlineCommands = shFile.split("\n").map(l => l.trim()).filter(l => l.length > 0).filter(l => !l.startsWith("#")).join(" ");
    return await $`podman machine ssh '${inlineCommands}'`;
  }

  async function execInlineCommand(command) {
    return await $`podman machine ssh '${command}'`;
  }

  return {
    execScriptFile,
    execInlineCommand
  }
}

export async function checkIfArtifactExists(artifact, shortcut) {
	const artifactList = await $`podman ${artifact} list`.text();
	return artifactList.includes(shortcut);
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

export async function execInteractiveAndTtyCommand(terminalName, command) {
  const fullCommand = "wt"
    + " new-tab"
    + " --maximized"
    + " --focus"
    + ` --title=${terminalName}`
    + ` --profile="Command Prompt"`
    + ` --appendCommandLine " /k ${command}"`;

  const options = {
    shell: true,
    detached: true,
    windowsVerbatimArguments: true,
    stdio: "ignore"
  };

  spawn(fullCommand, options);
}