import { useCmd } from "../../../utils";

const { exec: cmdExec } = useCmd();

export async function runInBareMetal(flags) {
  let configFile = await Bun.file(`${import.meta.dir}/opencode.json`).text();

  const envKeys = {
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    OPENCODE_CONFIG_CONTENT: configFile.replace("http://custom-ollama", "http://localhost")
  };

  const subProc = cmdExec([`cd ${flags.cwd} && opencode`], { env: envKeys });
  await subProc.exited;
}