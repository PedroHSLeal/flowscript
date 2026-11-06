# flowscript

A ~~dumb, error-prune, gibberish~~ simple way to carry a js runtime in a USB and execute ts from Bun.js

## How to use

```bash
# list all the workflows scripts that you have
flowscript --fs-list

# execute a workflow, considering these locations
# $(pwd)/.flowscript/workflows/editor/index.mjs
## ~/.config/flowscript/workflows/editor/index.mjs
flowscript ...bun-flags --fs-workflow editor ...args

# pick a workflow (global or local) and cd into its folder
# with a name, only the workflows with that name are listed
# (needs the shell function below)
flowscript --fs-goto
flowscript --fs-goto editor

# without any --fs- flag, it behaves as bun's CLI
# set BUN_BE_BUN=1 flowscript ...bun-args
flowscript ...bun-args