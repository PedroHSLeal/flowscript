import { $ } from "bun";
import { args, execInteractiveCommand, openInEditor, usePodman } from "../../utils";

const { checkIfArtifactExists } = usePodman();

$.nothrow();
$.cwd(import.meta.dir);

process.on("message", async function ({ flags, argv }) {
  if (!flags.cwd) return;

  let appName = "opencode";
  let containerName = `opencode__${flags.cwd.substring(flags.cwd.lastIndexOf("\\") + 1, flags.cwd.length)}`;

  if (!checkIfArtifactExists("image", "ghcr.io/anomalyco/opencode"))
    await $`podman pull ghcr.io/anomalyco/opencode`;

  if (flags.edit)
    await openInEditor(import.meta.dir);

  if (flags.dockerfile) {
    appName = "irezin/opencode";
    await $`podman build --tag irezin/opencode .`.quiet();
  }

  const command = "podman"
    + " run"
    + " --interactive"
    + " --tty"
    + " --env OPENCODE_CONFIG=/opencode/opencode.json"
    + ` --env OPENROUTER_API_KEY=${process.env.OPENROUTER_API_KEY}`
    + " --network intelligence"
    + ` --mount type=bind,src=${flags.cwd},dst=/playground`
    + ` --name ${containerName}`
    + ` ${appName}`;

  const subProc = await execInteractiveCommand(command);
  await subProc.exited;

  // await $`podman container kill ${containerName}`;
  await $`podman container rm ${containerName}`;

  process.disconnect();
});