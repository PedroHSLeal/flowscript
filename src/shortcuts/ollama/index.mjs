import { $ } from "bun";
import { checkIfArtifactExists } from "../../utils";

$.nothrow();
$.cwd(import.meta.dir);

process.on("message", async (flags) => {
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

  const { exitCode } = await $`podman run ${{ raw: args }}`.quiet();

  if (exitCode !== 0) {
    await $`podman container start ollama`;
  } process.disconnect();
});