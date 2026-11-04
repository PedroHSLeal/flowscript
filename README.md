# flowscript

A ~~dumb, error-prune, gibberish~~ simple way to carry a js runtime in a USB and execute ts from Bun.js

## How to use

```bash
# spawn a new custom terminal
flowscript

# list every place flowscript looks for workflows, with the
# path and the name of each workflow found on the machine
# (--list-workflows still works as an alias)
flowscript list

# execute a workflow, considering these locations
# $(pwd)/.flowscript/workflows/editor/index.mjs
## ~/.config/flowscript/workflows/editor/index.mjs
flowscript ...bun-flags --workflow editor ...args

# execute it as bun's CLI
# set BUN_BE_BUN=1 flowscript ...bun-args
flowscript --bun-be-bun ...bun-args
```

## flowscript list

`flowscript list` prints every workflow endpoint on the machine, in resolution
order, with the full path and the name of each workflow found there:

```text
flowscript workflows

project  /home/me/my-app/.flowscript/workflows
  build   /home/me/my-app/.flowscript/workflows/build/index.mjs
  editor  /home/me/my-app/.flowscript/workflows/editor/index.mjs

global   /home/me/.config/flowscript/workflows
  deploy/stage  /home/me/.config/flowscript/workflows/deploy/stage/index.mjs
  editor        /home/me/.config/flowscript/workflows/editor/index.mjs  (overridden by project)

4 workflows found, run one with: flowscript --workflow <name>
```

- `project` is `$(pwd)/.flowscript/workflows`, `global` is
  `~/.config/flowscript/workflows`
- an endpoint that does not exist on disk is still listed, marked with
  `(path not found)`
- a workflow of the project shadows a global one with the same name, marked
  with `(overridden by project)`
- nested workflows are named by their folder, e.g. `deploy/stage`, and
  `node_modules` is ignored
