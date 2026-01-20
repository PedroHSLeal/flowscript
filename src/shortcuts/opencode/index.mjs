import { $ } from "bun";
import { confirm } from "@inquirer/prompts";
import { execInteractiveAndTtyCommand, useDockerfile } from "../../utils";

const { checkIfDockerfileExists } = useDockerfile();

$.nothrow();
$.cwd(import.meta.dir);

const dockerfileExists = await checkIfDockerfileExists(`${import.meta.dir}\\Dockerfile`);

if (dockerfileExists) {
  const answerToEdit = await confirm({ message: "quer editar o Dockerfile?: " });
  if (answerToEdit) await $`vim Dockerfile`;

  const answerToBuild = await confirm({ message: "quer buildar o Dockerfile?: " });
  if (answerToBuild) {
    await $`podman build --tag irezin/opencode .`;
    await execInteractiveAndTtyCommand("opencode", "podman run --interactive --tty --network intelligence irezin/opencode");
  }
}
