# flowscript

A ~~dumb, error-prune, gibberish~~ simple way to carry a js runtime in a USB and execute ts from Bun.js

## How to use

```bash
# run a workflow, looking in these locations (local wins)
# $(pwd)/.flowscript/workflows/editor/index.mjs
# ~/.config/flowscript/workflows/editor/index.mjs
flowscript ---workflow editor ...args

# bun flags go before ---workflow, workflow args go after its name
flowscript --smol --watch ---workflow editor ...args

# nested workflows use their path
flowscript ---workflow tools/fmt

# list all the workflows that you have
flowscript ---workflow list

# pick a workflow (global or local) and print its folder
# with a name, only the workflows with that name are listed
# (use it through the shell function below to cd into it)
flowscript ---workflow goto
flowscript ---workflow goto editor

# show the help
flowscript ---workflow help

# anything else behaves as bun's CLI
# same as BUN_BE_BUN=1 flowscript ...bun-args
flowscript ...bun-args
```

### Flags

flowscript has a single flag, `---workflow <name> [...args]` (alias `---run`). Bun has no `---` flags,
so it never clashes with bun's (the full list of bun flags and subcommands is in [docs/bun-flags.md](docs/bun-flags.md)).

- Bun flags can come before it, everything after the name goes to the workflow.
- The name can also be attached with `=`: `---workflow=editor`.
- An unknown `---` flag is an error, instead of being silently passed to bun.
- Only the leading bun flags are read: the first bare word (a file, a script, a bun subcommand)
  ends the scan, so in `flowscript script.ts ---run x` the `---run x` goes to the script.
  Use `--` to stop flowscript from reading the rest of the arguments.

### Built-in workflows

These ship inside the flowscript binary ([workflows/](workflows)). A local or global workflow
with the same name takes precedence over them.

| Workflow | Meaning |
| --- | --- |
| `list` | list the local, global and built-in workflows |
| `goto [name]` | pick a workflow and print its folder |
| `help` | show the help |

### `goto` shell function

A program can't change the directory of your shell, so `goto` prints the folder and a shell function does the `cd`:

```bash
# bash / zsh
fsgo() { local dir; dir="$(flowscript ---workflow goto "$@")" && cd "$dir"; }
```

```powershell
# PowerShell
function fsgo { $dir = flowscript ---workflow goto @args; if ($LASTEXITCODE -eq 0) { Set-Location $dir } }
```
