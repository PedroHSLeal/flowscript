import { $ } from "bun";
import { confirm } from "@inquirer/prompts";
import { checkIfDockerfileExists } from "../../modules/dockerfile";
import { checkIfArtifactExists } from "../../utils";

$.nothrow();

const dockerfileExists = await checkIfDockerfileExists(import.meta.dir);

if (dockerfileExists) {
	const answerToEdit = await confirm({ message: "quer editar o Dockerfile?: " });
	if (answerToEdit) await $`vim Dockerfile`;

	const answerToBuild = await confirm({ message: "quer buildar o Dockerfile?: " });
	if (answerToBuild) {}
	else runSimpleCommand();
}

async function runSimpleCommand() {
	const containerRunning = checkIfArtifactExists("container", "ollama");
	if (!containerRunning) return;

	const args = " --name bunjs"
		+ " oven/bun";

	const { exitCode } = await $`podman run ${{ raw: args }}`;

	if (exitCode !== 0) {
		console.log("rodando container...");
		await $`podman container start ollama`;
	}
}
