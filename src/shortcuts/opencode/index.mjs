import { $ } from "bun";
import { confirm } from "@inquirer/prompts";
import { execInteractiveAndTtyCommand, useDockerfile } from "../../utils";

const { checkIfDockerfileExists } = useDockerfile();

$.nothrow();
$.cwd(import.meta.dir);

process.on("message", async (message) => {
  if (!message.cwd) return;

  let appName = "opencode";

  if (message.dockerfile) {
    const dockerfileExists = await checkIfDockerfileExists(`${import.meta.dir}\\Dockerfile`);

    if (dockerfileExists) {
      const answerToEdit = await confirm({ message: "quer editar o Dockerfile?: " });
      if (answerToEdit) await $`vim Dockerfile`;

      const answerToBuild = await confirm({ message: "quer buildar o Dockerfile?: " });
      if (answerToBuild) {
        await $`podman build --tag irezin/opencode .`;

        appName = "irezin/opencode";
      }
    }
  }

  const command = "podman"
    + " run"
    + " --interactive"
    + " --tty"
    + " --network intelligence"
    + ` --mount type=bind,src=${message.cwd},dst=/home`
    + ` ${appName}`;

  await execInteractiveAndTtyCommand("opencode", command);

});

