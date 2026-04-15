import { $ } from "bun";
import { usePodmanCLI } from "../../utils";

const { checkIfArtifactExists } = usePodmanCLI();

$.nothrow();
$.cwd(import.meta.dir);

process.on("message", async () => {
  if (!checkIfArtifactExists("image", false, "ghcr.io/anomalyco/opencode"))
    await $`podman pull ghcr.io/open-webui/open-webui:main`

  if (!checkIfArtifactExists("container", false, "open-webui")) return;

  const args = " --detach"
    + " --volume open-webui:/app/backend/data"
    + " --publish 3000:8080"
    + " --env OLLAMA_BASE_URL=http://ollama:11434"
    + " --network intelligence"
    + " --name open-webui"
    + " open-webui:main";

  const { exitCode } = await $`podman run ${{ raw: args }}`.quiet();

  if (exitCode !== 0) {
    await $`podman container start open-webui`;
  }

  process.disconnect();
});