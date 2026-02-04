import { $ } from "bun";
import { confirm } from "@inquirer/prompts";
import { execInteractiveCommand, useDockerfile, usePodman } from "../../utils";

const { checkIfDockerfileExists } = useDockerfile();
const { checkIfArtifactExists } = usePodman();

$.nothrow();
$.cwd(import.meta.dir);

process.on("message", async function (flags) {
  if (!flags.cwd) return;

  const isImageDownloaded = checkIfArtifactExists("image", "ghcr.io/anomalyco/opencode");
  if (!isImageDownloaded) await $`podman pull ghcr.io/anomalyco/opencode`;

  let appName = "opencode";

  if (flags.dockerfile) {
    const dockerfileExists = await checkIfDockerfileExists(`${import.meta.dir}\\Dockerfile`);
    appName = "irezin/opencode";

    if (dockerfileExists) {
      const answerToEdit = await confirm({ message: "quer editar o Dockerfile?: " });
      if (answerToEdit) await $`vim Dockerfile`;

      const answerToBuild = await confirm({ message: "quer buildar o Dockerfile?: " });
      if (answerToBuild) {
        await $`podman build --tag irezin/opencode .`;
      }
    }
  }

  const command = "podman"
    + " run"
    + " --interactive"
    + " --tty"
    + " --env OPENCODE_CONFIG=/opencode.json"
    + " --network intelligence"
    + ` --mount type=bind,src=${flags.cwd},dst=/home`
    + ` ${appName}`;

  const subProc = await execInteractiveCommand(command);
  await subProc.exited;

  process.disconnect();
});

