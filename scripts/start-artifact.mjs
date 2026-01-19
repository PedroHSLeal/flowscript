import { $ } from "bun";
import { fetchDockerHubImageRegistry, selectRegistry, pullImageFromDockerHub } from "../modules/docker-hub";
import { args, checkIfArtifactExists } from "../utils";

await main();

async function main() {
	const { values, positionals } = args({
			shortcut: { type: "string" },
			dockerfile: { type: "boolean" },
			edit: { type: "boolean" },
		});

	if (!values.shortcut) {
		console.log("--shortcut é obrigatório");
		return;
	}

	await checkIfPodmanIsOn();

	const containerExists = await checkIfArtifactExists("image", values.shortcut);

	if (!containerExists) {
		const data = await fetchDockerHubImageRegistry(values.shortcut);
		const imageName = await selectRegistry(data.ids);

		await pullImageFromDockerHub(imageName);
	}
	
	await execute(values);
}

async function checkIfPodmanIsOn() {
	try {
		await $`podman ps`.quiet();
	} catch (err) {
		await $`podman machine start`.quiet();
	}
}

async function execute({ shortcut, dockerfile }) {
	const outputList = await $`ls -l $(pwd)\\shortcuts`.text();

	if (!outputList.includes(shortcut)) {
		console.log(`o shortcut '${shortcut}' nao existe :(`);
		console.log(`vou criar agora!`);

		await $`mkdir $(pwd)\\shortcuts\\${shortcut}`;
		await $`touch $(pwd)\\shortcuts\\${shortcut}\\index.mjs`;

		if (values.dockerfile)
			await $`touch $(pwd)\\shortcuts\\${shortcut}\\Dockerfile`;
	}

	await $`bun $(pwd)\\shortcuts\\${shortcut}\\index.mjs`;
}
