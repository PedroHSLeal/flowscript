# flowscript

A ~~dumb, error-prune, gibberish~~ simple way to carry a js runtime in a USB and execute ts from Bun.js

## How to use

```bash
# spawn a new custom terminal
flowscript

# list all the workflows scripts that you have
flowscript --list-workflows

# execute a workflow, considering these locations
# $(pwd)/.flowscript/workflows/editor/index.mjs
## ~/.config/flowscript/workflows/editor/index.mjs
flowscript ...bun-flags --workflow editor ...args

# execute it as bun's CLI
# set BUN_BE_BUN=1 flowscript ...bun-args
flowscript --bun-be-bun ...bun-args
```