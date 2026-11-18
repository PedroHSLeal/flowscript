# flowscript

A ~~dumb, error-prune, gibberish~~ simple way to carry a js runtime in a USB and execute ts from Bun.js

## How to use

```bash
# run a workflow, looking in these locations (local wins)
# $(pwd)/.flowscript/workflows/editor/index.mjs
# ~/.config/flowscript/workflows/editor/index.mjs
flowscript @editor ...args

# bun flags go before the workflow, workflow args go after it
flowscript --smol --watch @editor ...args

# nested workflows use their path
flowscript @tools/fmt

# list all the workflows that you have
flowscript :list

# pick a workflow (global or local) and print its folder
# with a name, only the workflows with that name are listed
# (use it through the shell function below to cd into it)
flowscript :goto
flowscript :goto editor

# show the help
flowscript :help

# anything else behaves as bun's CLI
# same as BUN_BE_BUN=1 flowscript ...bun-args
flowscript ...bun-args
```

### Syntax

| Form | Meaning |
| --- | --- |
| `@<workflow>` | run a workflow; bun flags can come before it, everything after it goes to the workflow |
| `:<command>` | a flowscript command (`:list`/`:ls`, `:goto`/`:cd`, `:help`/`:h`); must be the first argument |
| anything else | passed to bun untouched |

Only the leading bun flags are scanned for `@`: the first bare word (a file, a script, a bun subcommand)
ends the scan, so `flowscript add @types/node` and `flowscript x @biomejs/biome` are plain bun calls.
Use `--` to stop flowscript from reading the rest of the arguments.

The full list of bun flags and subcommands is in [docs/bun-flags.md](docs/bun-flags.md).

### `:goto` shell function

A program can't change the directory of your shell, so `:goto` prints the folder and a shell function does the `cd`:

```bash
# bash / zsh
fsgo() { local dir; dir="$(flowscript :goto "$@")" && cd "$dir"; }
```

```powershell
# PowerShell
function fsgo { $dir = flowscript :goto @args; if ($LASTEXITCODE -eq 0) { Set-Location $dir } }
```
