import { $ } from "bun";
import { parseArgs } from "util";
import { select } from "@inquirer/prompts";

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

export async function checkIfArtifactExists(artifact, shortcut) {
	const artifactList = await $`podman ${artifact} list`.text();
	return artifactList.includes(shortcut);
}

export function args(flags) {
	return parseArgs({
		args: Bun.argv,
		options: flags,
		strict: true,
		allowPositionals: true,
	});
}
