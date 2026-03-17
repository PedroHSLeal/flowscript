import { $ } from "bun";
import { args, execInteractiveCommand, openInEditor, usePodman } from "../../utils";

const { checkIfArtifactExists } = usePodman();

$.nothrow();
$.cwd(import.meta.dir);

process.on("message", async function ({ flags, argv }) {
  let appName = "opencode";

  if (!flags.cwd) return;

  if (!checkIfArtifactExists("image", "ghcr.io/anomalyco/opencode"))
    await $`podman pull ghcr.io/anomalyco/opencode`;

  if (flags.edit)
    await openInEditor(import.meta.dir);

  if (flags.dockerfile) {
    appName = "irezin/opencode";
    await $`podman build --tag irezin/opencode .`;
  }

  const command = "podman"
    + " run"
    + " --interactive"
    + " --tty"
    + " --env OPENCODE_CONFIG=/opencode/opencode.json"
    + " --network intelligence"
    + ` --mount type=bind,src=${flags.cwd},dst=/playground`
    + ` ${appName}`;

  const subProc = await execInteractiveCommand(command);
  await subProc.exited;

  process.disconnect();
});

