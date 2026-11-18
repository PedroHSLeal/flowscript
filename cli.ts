// flowscript argv parsing
//
//   flowscript [...bun-flags] @<workflow> [...args]   run a workflow
//   flowscript :<command> [...args]                   run a flowscript command
//   flowscript [...bun-args]                          anything else goes straight to bun
//
// only the leading bun flags are scanned: the first bare word (a file, a script,
// a bun subcommand like `add` or `x`) ends the scan, so `bun add @types/node`
// or `flowscript x @biomejs/biome` keep working as plain bun calls

export const WORKFLOW_SIGIL = "@";
export const COMMAND_SIGIL = ":";

export const COMMANDS = {
  list: { aliases: ["ls"], usage: ":list", description: "list the global and local workflows" },
  goto: { aliases: ["cd"], usage: ":goto [name]", description: "pick a workflow and print its folder (use with the shell function)" },
  help: { aliases: ["h"], usage: ":help", description: "show this help" },
} as const;

export type CommandName = keyof typeof COMMANDS;

export type Invocation =
  | { kind: "bun"; args: string[] }
  | { kind: "workflow"; name: string; bunArgs: string[]; args: string[] }
  | { kind: "command"; name: CommandName; args: string[] }
  | { kind: "error"; message: string };

// bun runtime flags that take their value as the next argument (`--flag value`)
// the value must be skipped, otherwise `--preload @scope/pkg` would look like a workflow
// keep in sync with docs/bun-flags.md
export const BUN_FLAGS_WITH_VALUE = new Set([
  "-r", "--preload", "--require", "--import",
  "-e", "--eval", "-p", "--print",
  "-c", "--config",
  "--cwd",
  "--env-file",
  "--conditions",
  "--main-fields",
  "--extension-order",
  "--tsconfig-override",
  "-d", "--define",
  "-l", "--loader",
  "--jsx-factory", "--jsx-fragment", "--jsx-import-source", "--jsx-runtime",
  "--port",
  "--console-depth",
  "--fetch-preconnect",
  "--max-http-header-size",
  "--dns-result-order",
  "--unhandled-rejections",
  "--title",
  "--install",
  "--shell",
  "--elide-lines",
  "--filter", "-F",
  "--workspaces",
]);

export function parseArgs(argv: string[]): Invocation {
  let i = 0;

  while (i < argv.length) {
    const arg = argv[i]!;

    if (arg === "--") break;

    if (arg.startsWith("-")) {
      i += BUN_FLAGS_WITH_VALUE.has(arg) ? 2 : 1;
      continue;
    }

    if (arg.startsWith(WORKFLOW_SIGIL)) {
      const name = arg.slice(WORKFLOW_SIGIL.length);

      if (!name) return { kind: "error", message: `Missing workflow name after '${WORKFLOW_SIGIL}', e.g. ${WORKFLOW_SIGIL}editor` };

      return { kind: "workflow", name, bunArgs: argv.slice(0, i), args: argv.slice(i + 1) };
    }

    if (arg.startsWith(COMMAND_SIGIL)) {
      if (i > 0) return { kind: "error", message: `'${arg}' must be the first argument` };

      const name = resolveCommand(arg.slice(COMMAND_SIGIL.length));

      if (!name) return { kind: "error", message: `Unknown command '${arg}'. Run 'flowscript ${COMMAND_SIGIL}help'` };

      return { kind: "command", name, args: argv.slice(i + 1) };
    }

    break;
  }

  return { kind: "bun", args: argv };
}

function resolveCommand(input: string): CommandName | undefined {
  for (const [name, { aliases }] of Object.entries(COMMANDS)) {
    if (name === input || (aliases as readonly string[]).includes(input)) return name as CommandName;
  }

  return undefined;
}

export function helpText(): string {
  const rows: [string, string][] = [
    [`${WORKFLOW_SIGIL}<workflow> [...args]`, "run a workflow (bun flags can come before it)"],
    ...Object.values(COMMANDS).map((c): [string, string] => [
      c.usage,
      `${c.description} (alias: ${c.aliases.map(a => COMMAND_SIGIL + a).join(", ")})`,
    ]),
    ["[...bun-args]", "anything else is passed to bun"],
  ];
  const width = Math.max(...rows.map(([usage]) => usage.length));

  return ["Usage:", ...rows.map(([usage, description]) => `  flowscript ${usage.padEnd(width)}  ${description}`)].join("\n");
}
