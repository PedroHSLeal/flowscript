import { $ } from "bun";
import { usePodmanCLI } from "../../utils";

const { checkIfArtifactExists } = usePodmanCLI();

// $.nothrow();
$.cwd(import.meta.dir);

process.on("message", async () => {
  const args = [
    "--detach",
    "--gpus all",
    "--volume ollama:/root/.ollama",
    "--publish 11434:11434",
    "--env OLLAMA_CONTEXT_LENGTH=65536",
    "--network intelligence",
    "--replace",
    "--name custom-ollama"
  ];

  if (!(await checkIfArtifactExists("network", false, "intelligence"))) await $`podman network create intelligence`;
  if (!(await checkIfArtifactExists("image", false, "ollama"))) await $`podman pull docker.io/ollama/ollama`;

  const command = `podman run ${args.join(" ")} ollama`;
  await $`${{ raw: command }}`;

  process.disconnect();
});