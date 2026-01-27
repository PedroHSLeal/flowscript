import { $ } from "bun";
import { confirm } from "@inquirer/prompts";
import { checkIfArtifactExists, useDockerfile } from "../../utils";

const { checkIfDockerfileExists } = useDockerfile();

$.nothrow();
$.cwd(import.meta.dir);

const dockerfileExists = await checkIfDockerfileExists(`${import.meta.dir}\\Dockerfile`);

if (dockerfileExists) {
	const answerToEdit = await confirm({ message: "quer editar o Dockerfile?: " });
	if (answerToEdit) await $`vim Dockerfile`;

	const answerToBuild = await confirm({ message: "quer buildar o Dockerfile?: " });
	if (answerToBuild) {}
	else runSimpleCommand();
}
else await runSimpleCommand();

async function runSimpleCommand() {
	const containerRunning = checkIfArtifactExists("container", "ollama");
	if (!containerRunning) return;

	const args = " --detach"
		+ " --gpus all"
		+ " --volume ollama:/root/.ollama"
		+ " --publish 11434:11434"
		+ " --env OLLAMA_CONTEXT_LENGTH=65536"
		+ " --network intelligence"
		+ " --name ollama"
		+ " ollama/ollama";

	const { exitCode } = await $`podman run ${{ raw: args }}`;

	if (exitCode !== 0) {
		await $`podman container start ollama`;
	}
}
