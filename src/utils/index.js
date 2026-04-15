import { $ } from "bun";
import { parseArgs } from "util";

export * from "./podman";
export * from "./shell-code";
export * from "./uuid";
export * from "./symbolic-link";

export function args(flags, options = {}, args = Bun.argv) {
  let restOptions = {
    ... {
      strict: false,
      allownegative: true,
      allowpositionals: true,
      tokens: true
    },
    ...options
  };

  const result = parseArgs({
    args,
    options: flags,
    ...restOptions
  });

  if (Object.keys(options).length == 0) return result.values;
  else return result;
}

export function getFolderName(path) {
  return path
    .substring(path.lastIndexOf("\\") + 1, path.length)
    .replace(/[\-]/g, "_");
}

export async function openInEditor(cwd) {
  await $`code --wait .`.cwd(cwd);
}