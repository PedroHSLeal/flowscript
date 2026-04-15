import { $ } from "bun";
import { args } from "../../utils";
import { runInBareMetal } from "./engines/bare-metal";
import { runInContainer } from "./engines/docker-container";

$.nothrow();
$.cwd(import.meta.dir);

process.on("message", async function ({ flags, argv }) {
  if (flags.cwd) {
    let { "bare-metal": bareMetal } = args({ "bare-metal": { type: "boolean" } }, {}, argv);

    if (bareMetal) await runInBareMetal(flags);
    else await runInContainer(flags);
  }

  process.disconnect();
});