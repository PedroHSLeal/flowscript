// flowscript argv parsing
//
//   flowscript [...bun-flags] ---workflow <name> [...args]   run a workflow
//   flowscript ---workflow list|goto|help                    built-in workflows (see workflows/)
//   flowscript [...bun-args]                                 anything else goes straight to bun
//
// bun has no `---` flags (see docs/bun-flags.md), so the whole prefix belongs to flowscript
// only the leading bun flags are scanned: the first bare word (a file, a script,
// a bun subcommand like `add` or `x`) ends the scan, so `flowscript script.ts ---run x`
// passes `---run x` to the script

export const PREFIX = "---";

export const FLAGS = {
  workflow: { aliases: ["run"] },
} as const;

export type Invocation =
  | { kind: "bun"; args: string[] }
  | { kind: "workflow"; name: string; bunArgs: string[]; args: string[] }
  | { kind: "error"; message: string };

// bun runtime flags that take their value as the next argument (`--flag value`)
// the value must be skipped, otherwise `--eval ---list` would look like a flowscript flag
// taken from the "Global / runtime flags" table of docs/bun-flags.md (bun 1.4.4), keep in sync
// --inspect, --inspect-wait and --inspect-brk are left out on purpose: their value is optional
// and bun only reads it when attached with `=`
export const BUN_FLAGS_WITH_VALUE = new Set([
  "-r", "--preload", "--require", "--import",
  "-e", "--eval", "-p", "--print",
  "-c", "--config",
  "-d", "--define",
  "-l", "--loader",
  "-F", "--filter",
  "--cwd",
  "--env-file",
  "--conditions",
  "--main-fields",
  "--extension-order",
  "--tsconfig-override",
  "--drop",
  "--feature",
  "--jsx-factory", "--jsx-fragment", "--jsx-import-source", "--jsx-runtime",
  "--port",
  "--console-depth",
  "--fetch-preconnect",
  "--max-http-header-size",
  "--dns-result-order",
  "--unhandled-rejections",
  "--user-agent",
  "--redirect-warnings",
  "--disable-warning",
  "--title",
  "--install",
  "--shell",
  "--elide-lines",
  "--watch-kill-signal",
  "--cpu-prof-name", "--cpu-prof-dir", "--cpu-prof-interval",
  "--heap-prof-name", "--heap-prof-dir", "--heap-prof-interval",
  "--cron-title", "--cron-period",
]);

export function parseArgs(argv: string[]): Invocation {
  let i = 0;

  while (i < argv.length) {
    const arg = argv[i]!;

    // `--` ends the flags and a lone `-` makes bun read the program from stdin
    if (arg === "--" || arg === "-") break;

    if (arg.startsWith(PREFIX)) return parseFlowscriptFlag(argv, i);

    if (arg.startsWith("-")) {
      i += BUN_FLAGS_WITH_VALUE.has(arg) ? 2 : 1;
      continue;
    }

    break;
  }

  return { kind: "bun", args: argv };
}

function parseFlowscriptFlag(argv: string[], i: number): Invocation {
  const arg = argv[i]!;
  // `---workflow=editor` is the same as `---workflow editor`
  const [flag, inlineValue] = splitOnce(arg.slice(PREFIX.length), "=");

  if (flag !== "workflow" && !(FLAGS.workflow.aliases as readonly string[]).includes(flag)) {
    return { kind: "error", message: `Unknown flag '${PREFIX}${flag}'. Run 'flowscript ${PREFIX}workflow help'` };
  }

  const rest = argv.slice(i + 1);
  const workflow = inlineValue ?? rest.shift();

  if (!workflow) return { kind: "error", message: `Missing workflow name after '${PREFIX}${flag}', e.g. ${PREFIX}workflow editor` };

  return { kind: "workflow", name: workflow, bunArgs: argv.slice(0, i), args: rest };
}

function splitOnce(value: string, separator: string): [string, string | undefined] {
  const index = value.indexOf(separator);

  return index === -1 ? [value, undefined] : [value.slice(0, index), value.slice(index + 1)];
}
