import { $ } from "bun";
import { args, execInteractiveCommand, usePodman } from "../../utils";

const { checkIfArtifactExists } = usePodman();

$.nothrow();
$.cwd(import.meta.dir);

process.on("message", async ({ flags, argv }) => {
  if (!checkIfArtifactExists("container", "ollama")) return;

  let { values: otherValues } = args({
    action: { type: "string", short: "a" },
    model: { type: "string", short: "m" }
  }, argv);

  let command = "";

  switch( otherValues.action) {
    case "pull":
      command = `podman exec -it ollama ollama pull ${otherValues.model}`;
      break;
  }

  await execInteractiveCommand(command);

  process.disconnect();
});