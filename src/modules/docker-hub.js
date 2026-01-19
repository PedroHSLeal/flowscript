import { $ } from "bun";
import { select } from "@inquirer/prompts";
import { checkIfArtifactExists } from "../utils";

export async function fetchDockerHubImageRegistry(shortcut) {
	const payload = await $`curl https://hub.docker.com/search.data?q=${shortcut}`.json();
	return {
		totalResults: payload[payload.indexOf("total") + 1],
		ids: payload.filter(p => typeof p == "string").filter(p => p.endsWith(`/${shortcut}`))
	};
}

export async function selectRegistry(ids) {
	return await select({
		loop: false,
		message: "qual imagem tu quer baixar?: ",
		choices: ids.map(i => ({ name: i, value: i, description: "" }))
	});
}

export async function pullImageFromDockerHub(imageName) {
	const imageExists = await checkIfArtifactExists("image", imageName);
	if (!imageExists) {
		await $`podman pull docker.io/${imageName}`;
	}
}
