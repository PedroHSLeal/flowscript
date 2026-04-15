import { $ } from "bun";
import { args, execInteractiveCommand } from "../../utils";


$.nothrow();
$.cwd(import.meta.dir);

process.on("message", async ({ flags, argv }) => {
  let { action } = args({ action: { type: "string", short: "a" } }, {}, argv);

  let command = "";

  switch (action) {
    case "install":
      let { model } = args({ model: { type: "string", short: "m" } }, {}, argv);
      command = `podman exec -it ollama ollama pull ${model}`;
      break;
    case "install-models":
      const models = await $`cat models.txt`.text();
      command = `podman exec -it ollama ollama pull ${models.split("\n").join(" ")}`;
      break;
    case "list":
      command = `podman exec -it ollama ollama ls`;
      break;
  }

  execInteractiveCommand(command);

  process.disconnect();
});