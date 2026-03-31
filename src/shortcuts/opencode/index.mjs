import { $ } from "bun";
import { args, execInteractiveCommand, openInEditor, usePodman } from "../../utils";

const { checkIfArtifactExists } = usePodman();

$.nothrow();
$.cwd(import.meta.dir);

process.on("message", async function ({ flags, argv }) {
  if (!flags.cwd) return;

  let { values: { env: environmentToBuild, "bare-metal": bareMetal } } = args({ "bare-metal": { type: "boolean" }, "env": { type: "string", short: "e" } }, {}, argv);
  let folderName = flags.cwd.substring(flags.cwd.lastIndexOf("\\") + 1, flags.cwd.length).replace(/[\-]/g, "_");
  let name = `opencode`;

  if (!checkIfArtifactExists("image", "ghcr.io/anomalyco/opencode"))
    await $`podman pull ghcr.io/anomalyco/opencode`;

  let command = "podman"
    + " run"
    + " --interactive"
    + " --tty"
    + " --env OPENCODE_CONFIG=/opencode/opencode.json"
    + ` --env OPENROUTER_API_KEY=${process.env.OPENROUTER_API_KEY}`
    + " --network intelligence"
    + ` --mount type=bind,src=${flags.cwd},dst=/playground`;

  if (bareMetal) {
    const envKeys = {
      OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
      OPENCODE_CONFIG_CONTENT: await Bun.file(`${import.meta.dir}/opencode.json`).text()
    };

    const subProc = await execInteractiveCommand("opencode", envKeys);
    await subProc.exited;
  }
  else {
    if (environmentToBuild) {
      name = `opencode_${folderName}_${env}`;

      await $`cp ${import.meta.dir}/environments/${environmentToBuild}/Dockerfile Dockerfile`
      await $`podman build --tag ${name} .`;
      await $`rm Dockerfile`;

      command += ` --name ${name}`;
    }

    command += ` ${name}`;

    const subProc = await execInteractiveCommand(command);
    await subProc.exited;

    await $`podman container rm ${containerName}`;
  }

  process.disconnect();
});