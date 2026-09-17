# flowscript

A ~~dumb, error-prune, gibbirish~~ simple way to carry a js runtime in a usb drive and execute js/ts from Bun.js

## How to use

```bash
flowscript
# spawn a new custom terminal

flowscript --list-workflows
# list all the workflows scripts that you have

flowscript editor ...args
# $(pwd)/.flowscript/workflows/editor/index.mjs ...args
## ~/.config/flowscript/workflows/editor/index.mjs ...args

flowscript --bun-be-bun ...args
# set BUN_BE_BUN=1 flowscript ...args
```