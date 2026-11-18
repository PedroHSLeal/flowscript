# Bun CLI flags and subcommands reference

- **Bun version:** 1.4.4 (`1.4.4+38afee6c8`, Linux x64)
- **Generated:** 2026-11-18
- **Purpose:** reference for designing flowscript's own CLI on top of Bun (flowscript forwards argv to Bun with `BUN_BE_BUN=1` when it gets no flowscript-specific args), mainly to avoid name collisions.

**Source of truth.** Everything here comes from the help output of the installed binary, plus a few experiments that are marked as such. Nothing comes from the online docs. If something is not printed by `--help`, this file says so.

## How to regenerate

```sh
bun --version && bun --revision
bun --help                       # global/runtime flags + command list
bun <cmd> --help                 # for every command in the table below
bun fmt --help --all             # bun fmt hides most flags without --all
bun pm --help                    # pm subcommands (bun pm <sub> --help prints the same text)

# one-shot dump
for c in run test check fmt x repl exec install add remove update audit dedupe prune \
         outdated link unlink publish patch patch-commit pm info why build init create \
         upgrade completions; do
  echo "##### bun $c"; bun "$c" --help 2>&1
done
```

Run the experiments in an empty scratch directory, not in a project. A `BUN_OPTIONS` environment variable changes the results: it is set to `--smol` in the environment where this file was made, so the experiments ran with `env -u BUN_OPTIONS`.

---

## Subcommands

The first group is the list printed by `bun --help`. Aliases come from the `Alias:` line of each command's help, or from running them.

| Name | Aliases | Description (from help) |
|---|---|---|
| `run` | (implicit: `bun <file\|script>`) | Execute a file with Bun / run a package.json script |
| `test` | | Run unit tests with Bun |
| `check` | | Type check a TypeScript project |
| `fmt` | | Format JavaScript and TypeScript, like Prettier |
| `x` | `bunx` (separate binary name) | Execute a package binary (CLI), installing if needed |
| `repl` | | Start a REPL session with Bun |
| `exec` | | Run a shell script directly with Bun |
| `install` | `i`, `ci` (undocumented) | Install dependencies for a package.json |
| `add` | `a` | Add a dependency to package.json |
| `remove` | `rm`, `r`, `uninstall` (undocumented) | Remove a dependency from package.json |
| `update` | `up` | Update outdated dependencies |
| `audit` | | Check installed packages for vulnerabilities (`bun audit fix` is a sub-mode) |
| `dedupe` | | Remove duplicate versions from the lockfile |
| `prune` | | Remove packages that are not in the lockfile from node_modules |
| `outdated` | | Display latest versions of outdated dependencies |
| `link` | | Register or link a local npm package |
| `unlink` | | Unregister a local npm package |
| `publish` | | Publish a package to the npm registry |
| `patch` | | Prepare a package for patching |
| `pm` | `list` → `pm ls`, `whoami` → `pm whoami` (undocumented) | Additional package management utilities |
| `info` | | Display package metadata from the registry |
| `why` | | Explain why a package is installed |
| `build` | `bun` (undocumented: `bun bun --help` prints build help) | Bundle TypeScript & JavaScript into a single file |
| `init` | | Start an empty Bun project from a built-in template |
| `create` | `c` | Create a new project from a template |
| `upgrade` | | Upgrade to latest version of Bun |

The next commands work but are not in the `bun --help` command list. Each one was checked by running it.

| Name | What it does (observed) |
|---|---|
| `patch-commit` | Has its own help: "Generate a patch out of a directory and save it. This is equivalent to bun patch --commit." |
| `completions` | Prints a bash completion script when stdout is not a TTY (`Usage: bun completions`) |
| `getcompletes` | Prints a word list for shell completion (`add build bun create discord info install link pm remove repl run test unlink update upgrade x`) |
| `discord` | Prints `- https://bun.com/discord` |
| `help` | Same output as `bun --help` |

**Reserved names.** These print `Uh-oh. bun <name> is a subcommand reserved for future use by Bun.` They never run a package.json script of the same name; you need `bun run <name>` for that. The names are `deploy`, `cloud`, `config`, `use`, `auth`, `login` and `logout`.

**Not subcommands in 1.4.4.** These fall through to script lookup (`error: Script not found "<name>"`): `view`, `feedback`, `lint`, `t`, `ls`, `pack`, `version`, `scan`, `trust`, `untrusted`, `migrate`, `dev`, `start`, `serve`, `shell`, `eval`, `node`, `npx`, `dlx`. `lint` does appear next to the command names inside the binary's strings, but `bun lint` behaves like a script lookup. `bun pm view` exists, and its help says to "use `bun info` instead".

---

## Global / runtime flags

These are accepted by `bun` itself, as in `bun [flags] <file|script>`, and by `bun run`. `bun run --help` prints the same list except `-v/--version` and `--revision`, which only top-level `bun --help` lists. `bun repl --help` prints exactly the `bun run --help` text.

**Value forms (tested).** The help writes `--flag=<val>`. Each of these works: `--preload=./x`, `--preload ./x`, `-r ./x`, `-r=./x` and `-r./x`. Boolean flags reject a value (`--hot=1` gives `error: The argument '--hot' does not take a value.`). An optional-value flag such as `--inspect` does not consume the next argument (`bun --inspect file.ts` runs `file.ts`), so its value must be attached with `=`. Short flags can be combined (`-bi` was accepted).

| Flag | Short | Takes value? | Description |
|---|---|---|---|
| `--silent` |  | no | Don't print the script command |
| `--elide-lines` |  | yes: `--elide-lines=<val>` | Number of lines of script output shown when using --filter (default: 0, show all lines) |
| `--version` | `-v` | no | Print version and exit |
| `--revision` |  | no | Print version with revision and exit |
| `--filter` | `-F` | yes: `--filter=<val>` | Run a script in all workspace packages matching the pattern |
| `--bun` | `-b` | no | Force a script or package to use Bun's runtime instead of Node.js (via symlinking node) |
| `--no-orphans` |  | no | Exit when the parent process dies, and on exit kill every descendant. |
| `--shell` |  | yes: `--shell=<val>` | Control the shell used for package.json scripts. Supports either 'bun' or 'system' |
| `--workspaces` |  | no | Run a script in all workspace packages (from the "workspaces" field in package.json) |
| `--parallel` |  | no | Run multiple scripts concurrently with Foreman-style output |
| `--sequential` |  | no | Run multiple scripts sequentially with Foreman-style output |
| `--no-exit-on-error` |  | no | Continue running other scripts when one fails (with --parallel/--sequential) |
| `--watch` |  | no | Automatically restart the process on file change |
| `--watch-kill-signal` |  | yes: `--watch-kill-signal=<val>` | Signal whose handlers run when --watch restarts the process (default: "SIGTERM") |
| `--hot` |  | no | Enable auto reload in the Bun runtime, test runner, or bundler |
| `--no-clear-screen` |  | no | Disable clearing the terminal screen on reload when --hot or --watch is enabled |
| `--check` |  | no | Type check before running. Nothing runs if there are type errors. Alone: bun check |
| `--smol` |  | no | Use less memory, but run garbage collection more often |
| `--interactive` |  | no | Start a Node.js-compatible REPL, like node --interactive |
| `--preload` | `-r` | yes: `--preload=<val>` | Import a module before other modules are loaded |
| `--require` |  | yes: `--require=<val>` | Alias of --preload, for Node.js compatibility |
| `--import` |  | yes: `--import=<val>` | Alias of --preload, for Node.js compatibility |
| `--inspect` |  | yes: `--inspect=<val>` | Activate Bun's debugger |
| `--inspect-wait` |  | yes: `--inspect-wait=<val>` | Activate Bun's debugger, wait for a connection before executing |
| `--inspect-brk` |  | yes: `--inspect-brk=<val>` | Activate Bun's debugger, set breakpoint on first line of code and wait |
| `--cpu-prof` |  | no | Start CPU profiler and write profile to disk on exit |
| `--cpu-prof-name` |  | yes: `--cpu-prof-name=<val>` | Specify the name of the CPU profile file |
| `--cpu-prof-dir` |  | yes: `--cpu-prof-dir=<val>` | Specify the directory where the CPU profile will be saved |
| `--cpu-prof-md` |  | no | Output CPU profile in markdown format (grep-friendly, designed for LLM analysis) |
| `--cpu-prof-interval` |  | yes: `--cpu-prof-interval=<val>` | Specify the sampling interval in microseconds for CPU profiling (default: 1000) |
| `--heap-prof` |  | no | Write a heap profile to disk on exit (.heapprofile) |
| `--heap-prof-name` |  | yes: `--heap-prof-name=<val>` | Specify the name of the heap profile file |
| `--heap-prof-dir` |  | yes: `--heap-prof-dir=<val>` | Specify the directory where the heap profile will be saved |
| `--heap-prof-md` |  | no | Generate markdown heap profile on exit (for CLI analysis) |
| `--heap-prof-interval` |  | yes: `--heap-prof-interval=<val>` | Specify the average sampling interval in bytes for heap profiling (default: 524288) |
| `--if-present` |  | no | Exit without an error if the entrypoint does not exist |
| `--no-install` |  | no | Disable auto install in the Bun runtime |
| `--install` |  | yes: `--install=<val>` | Configure auto-install behavior. One of "auto" (default, auto-installs when no node_modules), "fallback" (missing packages only), "force" (always). |
| — | `-i` | no | Auto-install dependencies during execution. Equivalent to --install=fallback. |
| `--eval` | `-e` | yes: `--eval=<val>` | Evaluate argument as a script |
| `--print` | `-p` | yes: `--print=<val>` | Evaluate argument as a script and print the result |
| `--prefer-offline` |  | no | Skip staleness checks for packages in the Bun runtime and resolve from disk |
| `--prefer-latest` |  | no | Use the latest matching versions of packages in the Bun runtime, always checking npm |
| `--port` |  | yes: `--port=<val>` | Set the default port for Bun.serve |
| `--conditions` |  | yes: `--conditions=<val>` | Pass custom conditions to resolve |
| `--fetch-preconnect` |  | yes: `--fetch-preconnect=<val>` | Preconnect to a URL while code is loading |
| `--experimental-http2-fetch` |  | no | Offer h2 in fetch() TLS ALPN. Same as BUN_FEATURE_FLAG_EXPERIMENTAL_HTTP2_CLIENT=1 |
| `--experimental-http3-fetch` |  | no | Honor Alt-Svc: h3 in fetch() and upgrade to HTTP/3. Same as BUN_FEATURE_FLAG_EXPERIMENTAL_HTTP3_CLIENT=1 |
| `--max-http-header-size` |  | yes: `--max-http-header-size=<val>` | Set the maximum size of HTTP headers in bytes. Default is 16KiB |
| `--insecure-http-parser` |  | no | Use an insecure HTTP parser that accepts invalid HTTP headers |
| `--dns-result-order` |  | yes: `--dns-result-order=<val>` | Set the default order of DNS lookup results. Valid orders: verbatim (default), ipv4first, ipv6first |
| `--experimental-stream-iter` |  | no | Enable the experimental stream/iter API (node:stream/iter, node:zlib/iter). |
| `--expose-gc` |  | no | Expose gc() on the global object. Has no effect on Bun.gc(). |
| `--no-deprecation` |  | no | Suppress all reporting of the custom deprecation. |
| `--throw-deprecation` |  | no | Determine whether or not deprecation warnings result in errors. |
| `--no-warnings` |  | no | Silence all process warnings |
| `--trace-warnings` |  | no | Show stack traces on process warnings |
| `--trace-deprecation` |  | no | Show stack traces on deprecations |
| `--pending-deprecation` |  | no | Emit pending deprecation warnings |
| `--redirect-warnings` |  | yes: `--redirect-warnings=<val>` | Write process warnings to the given file instead of printing to stderr |
| `--disable-warning` |  | yes: `--disable-warning=<val>` | Silence specific process warnings by code or type |
| `--title` |  | yes: `--title=<val>` | Set the process title |
| `--zero-fill-buffers` |  | no | Boolean to force Buffer.allocUnsafe(size) to be zero-filled. |
| `--use-system-ca` |  | no | Use the system's trusted certificate authorities |
| `--use-openssl-ca` |  | no | Use OpenSSL's default CA store |
| `--use-bundled-ca` |  | no | Use bundled CA store |
| `--tls-min-v1.0` |  | no | Set the default TLS minimum to TLSv1.0 |
| `--tls-min-v1.1` |  | no | Set the default TLS minimum to TLSv1.1 |
| `--tls-min-v1.2` |  | no | Set the default TLS minimum to TLSv1.2 |
| `--tls-min-v1.3` |  | no | Set the default TLS minimum to TLSv1.3 |
| `--tls-max-v1.2` |  | no | Set the default TLS maximum to TLSv1.2 |
| `--tls-max-v1.3` |  | no | Set the default TLS maximum to TLSv1.3 |
| `--redis-preconnect` |  | no | Preconnect to $REDIS_URL at startup |
| `--sql-preconnect` |  | no | Preconnect to PostgreSQL at startup |
| `--no-addons` |  | no | Throw an error if process.dlopen or bun:ffi cc() is called, and disable export condition "node-addons" |
| `--no-ffi-cc` |  | no | Throw an error if bun:ffi cc() is called (disables the C compiler) |
| `--unhandled-rejections` |  | yes: `--unhandled-rejections=<val>` | One of "strict", "throw", "warn", "none", or "warn-with-error-code" |
| `--console-depth` |  | yes: `--console-depth=<val>` | Set the default depth for console.log object inspection (default: 2) |
| `--user-agent` |  | yes: `--user-agent=<val>` | Set the default User-Agent header for HTTP requests |
| `--cron-title` |  | yes: `--cron-title=<val>` | Title for cron execution mode |
| `--cron-period` |  | yes: `--cron-period=<val>` | Cron period for cron execution mode |
| `--main-fields` |  | yes: `--main-fields=<val>` | Main fields to lookup in package.json. Defaults to --target dependent |
| `--preserve-symlinks` |  | no | Preserve symlinks when resolving files |
| `--preserve-symlinks-main` |  | no | Preserve symlinks when resolving the main entry point |
| `--extension-order` |  | yes: `--extension-order=<val>` | Defaults to: .tsx,.ts,.jsx,.js,.json |
| `--tsconfig-override` |  | yes: `--tsconfig-override=<val>` | Specify custom tsconfig.json. Default $cwd/tsconfig.json |
| `--define` | `-d` | yes: `--define=<val>` | Substitute K:V while parsing, e.g. --define process.env.NODE_ENV:"development". Values are parsed as JSON. |
| `--drop` |  | yes: `--drop=<val>` | Remove function calls, e.g. --drop=console removes all console.\* calls. |
| `--feature` |  | yes: `--feature=<val>` | Enable a feature flag for dead-code elimination, e.g. --feature=SUPER_SECRET |
| `--loader` | `-l` | yes: `--loader=<val>` | Parse files with .ext:loader, e.g. --loader .js:jsx. Valid loaders: js, jsx, ts, tsx, json, toml, text, file, wasm, napi |
| `--no-macros` |  | no | Disable macros from being executed in the bundler, transpiler and runtime |
| `--jsx-factory` |  | yes: `--jsx-factory=<val>` | Changes the function called when compiling JSX elements using the classic JSX runtime |
| `--jsx-fragment` |  | yes: `--jsx-fragment=<val>` | Changes the function called when compiling JSX fragments |
| `--jsx-import-source` |  | yes: `--jsx-import-source=<val>` | Declares the module specifier to be used for importing the jsx and jsxs factory functions. Default: "react" |
| `--jsx-runtime` |  | yes: `--jsx-runtime=<val>` | "automatic" (default) or "classic" |
| `--jsx-side-effects` |  | no | Treat JSX elements as having side effects (disable pure annotations) |
| `--ignore-dce-annotations` |  | no | Ignore tree-shaking annotations such as @\_\_PURE\_\_ |
| `--env-file` |  | yes: `--env-file=<val>` | Load environment variables from the specified file(s) |
| `--no-env-file` |  | no | Disable automatic loading of .env files |
| `--cwd` |  | yes: `--cwd=<val>` | Absolute path to resolve files & entry points from. This just changes the process' cwd. |
| `--config` | `-c` | yes: `--config=<val>` | Specify path to Bun config file. Default $cwd/bunfig.toml |
| `--help` | `-h` | no | Display this menu and exit |

The footer of `bun --help` says: "(more flags in bun install --help, bun test --help, and bun build --help)".

---

## Per-subcommand flags

### `bun run`

The flags are the runtime flags above, minus `-v/--version` and `--revision`. `bun run` has no flags of its own.

Behaviour (tested): `bun run <name>` is the same as `bun <name>`, except that `bun run` reaches a package.json script whose name collides with a built-in subcommand, for example `bun run build`.

### `bun test`

Usage: `bun test [flags] [<patterns>]`. The help lists only the test-specific flags below. The runtime flags also work, but the help does not list them: `--preload` and `--define` were confirmed to take effect, and the help's own example uses `bun test --check`.

| Flag | Short | Takes value? | Description |
|---|---|---|---|
| `--no-orphans` |  | no | Exit when the parent process dies, and on exit kill every descendant. |
| `--timeout` |  | yes: `--timeout=<val>` | Set the per-test timeout in milliseconds, default is 5000. |
| `--update-snapshots` | `-u` | no | Update snapshot files |
| `--rerun-each` |  | yes: `--rerun-each=<val>` | Re-run each test file &lt;NUMBER> times, helps catch certain bugs |
| `--retry` |  | yes: `--retry=<val>` | Default retry count for all tests, overridden by per-test { retry: N } |
| `--todo` |  | no | Include tests that are marked with "test.todo()" |
| `--only` |  | no | Run only tests that are marked with "test.only()" or "describe.only()" |
| `--pass-with-no-tests` |  | no | Exit with code 0 when no tests are found |
| `--concurrent` |  | no | Treat all tests as `test.concurrent()` tests |
| `--randomize` |  | no | Run tests in random order |
| `--seed` |  | yes: `--seed=<val>` | Set the random seed for test randomization |
| `--coverage` |  | no | Generate a coverage profile |
| `--coverage-reporter` |  | yes: `--coverage-reporter=<val>` | Report coverage in 'text' and/or 'lcov'. Defaults to 'text'. Implies --coverage. |
| `--coverage-dir` |  | yes: `--coverage-dir=<val>` | Directory for coverage files. Defaults to 'coverage'. |
| `--bail` |  | yes: `--bail=<val>` | Exit the test suite after &lt;NUMBER> failures. If you do not specify a number, it defaults to 1. |
| `--test-name-pattern` | `-t` | yes: `--test-name-pattern=<val>` | Run only tests with a name that matches the given regex. |
| `--reporter` |  | yes: `--reporter=<val>` | Test output reporter format. Available: 'junit' (requires --reporter-outfile), 'dots'. Default: console output. |
| `--reporter-outfile` |  | yes: `--reporter-outfile=<val>` | Output file path for the reporter format (required with --reporter). |
| `--dots` |  | no | Enable dots reporter. Shorthand for --reporter=dots. |
| `--only-failures` |  | no | Only display test failures, hiding passing tests. |
| `--max-concurrency` |  | yes: `--max-concurrency=<val>` | Maximum number of concurrent tests to execute at once. Default is 20. |
| `--path-ignore-patterns` |  | yes: `--path-ignore-patterns=<val>` | Glob patterns for test file paths to ignore. |
| `--changed` |  | yes: `--changed=<val>` | Only run test files affected by changed files according to git. Optionally pass a commit or branch to compare against. |
| `--isolate` |  | no | Run each test file in a fresh global object. Leaked handles from one file cannot affect another. |
| `--no-isolate` |  | no | With --parallel: let each worker keep one global and module registry across the files it runs (faster; files can see each other's leftovers). |
| `--parallel` |  | yes: `--parallel=<val>` | Run test files in parallel using N worker processes. Implies --isolate. Defaults to CPU core count. |
| `--parallel-delay` |  | yes: `--parallel-delay=<val>` | Milliseconds the first --parallel worker must be busy before spawning the rest. 0 spawns all immediately. Default 5. |
| `--test-worker` |  | no | (internal) Run as a --parallel worker, receiving files over IPC. |
| `--shard` |  | yes: `--shard=<val>` | Run a subset of test files, e.g. '--shard=1/3' runs the first of three shards. Useful for splitting tests across multiple CI jobs. |
| `--timings` |  | yes: `--timings=<val>` | JSON file(s) of per-file durations (ms); several are merged, e.g. one per CI shard. Balances --shard by total time and makes --parallel start the slowest files first. |
| `--update-timings` |  | no | After the run, write measured per-file durations to the first --timings file (only this shard's files under --shard; merged with what was read otherwise). |

### `bun check`

Usage: `bun check [flags] [...files or directories]`. The runtime equivalent is `bun --check <file>`, which type checks and then runs.

| Flag | Short | Takes value? | Description |
|---|---|---|---|
| `--project` | `-p` | yes: `--project=<val>` | Path to a tsconfig.json or its directory |
| `--pretty` |  | yes: `--pretty=<val>` | Show source code around each error (default in a terminal) |
| `--build` | `-b` | no | Check the projects in references too, like tsc -b |
| `--no-pretty` |  | no | One line per error, like tsc --pretty false (default when piped) |
| `--all` |  | no | Show every error (above 50, identical errors are grouped) |
| `--threads` |  | yes: `--threads=<val>` | Number of threads (default: one per CPU core) |
| `--timing` |  | no | Print load and check times |
| `--cwd` |  | yes: `--cwd=<val>` | Set the working directory |
| `--no-script` |  | no | Run the type checker even if the project has a check script |
| `--help` | `-h` | no | Print this help menu |

The last help line is `--strict, --target=<val>, ...  Any compiler option, as for tsc. Overrides tsconfig.json`. So any tsc compiler option is accepted (for example `bun check --noUncheckedIndexedAccess`), but a made-up flag is rejected with `error: Unknown flag "--bogus"`.

### `bun fmt`

Usage: `bun fmt [flags] [...files, directories or patterns]`. `bun fmt --help` shows only 11 common flags. The full list below comes from `bun fmt --help --all`; according to the help, `--help-all` is the same. The "Group" column is the section heading in the help.

| Flag | Short | Takes value? | Description | Group |
|---|---|---|---|---|
| `--config` |  | yes: `--config=<val>` | Use this config file instead of looking for one | Options |
| `--no-config` |  | no | Do not look for a config file | Options |
| `--no-editorconfig` |  | no | Do not read .editorconfig | Options |
| `--init` |  | no | Add a [fmt] section to bunfig.toml | Options |
| `--doctor` |  | no | Show which files are formatted natively and which packages you can remove | Options |
| `--print-width` |  | yes: `--print-width=<val>` | The line length to wrap at (default: 80) | Options |
| `--tab-width` |  | yes: `--tab-width=<val>` | Spaces per indentation level (default: 2) | Options |
| `--use-tabs` |  | no | Indent with tabs | Options |
| `--no-semi` |  | no | Only print semicolons where they are needed | Options |
| `--single-quote` |  | no | Use single quotes | Options |
| `--jsx-single-quote` |  | no | Use single quotes in JSX | Options |
| `--quote-props` |  | yes: `--quote-props=<val>` | as-needed (default), consistent, or preserve | Options |
| `--trailing-comma` |  | yes: `--trailing-comma=<val>` | all (default), es5, or none | Options |
| `--no-bracket-spacing` |  | no | No spaces inside the braces of an object literal | Options |
| `--bracket-same-line` |  | no | Put the closing bracket of a multi-line element at the end of the last line | Options |
| `--arrow-parens` |  | yes: `--arrow-parens=<val>` | always (default) or avoid | Options |
| `--object-wrap` |  | yes: `--object-wrap=<val>` | preserve (default) or collapse | Options |
| `--single-attribute-per-line` |  | no | One attribute per line in HTML, Vue, and JSX | Options |
| `--html-whitespace-sensitivity` |  | yes: `--html-whitespace-sensitivity=<val>` | css (default), strict, or ignore | Options |
| `--vue-indent-script-and-style` |  | no | Indent the code in the script and style tags of Vue files | Options |
| `--prose-wrap` |  | yes: `--prose-wrap=<val>` | preserve (default), always, or never | Options |
| `--embedded-language-formatting` |  | yes: `--embedded-language-formatting=<val>` | auto (default) or off | Options |
| `--end-of-line` |  | yes: `--end-of-line=<val>` | lf (default), crlf, cr, or auto | Options |
| `--no-insert-final-newline` |  | no | Do not end files with a newline | Options |
| `--sort-imports` |  | no | Sort and group imports | Options |
| `--sort-tailwindcss` |  | no | Sort Tailwind CSS classes | Options |
| `--sort-package-json` |  | no | Sort the keys of package.json | Options |
| `--jsdoc` |  | no | Format JSDoc comments | Options |
| `--svelte` |  | no | Format Svelte components (default without a Prettier or oxfmt config) | Options |
| `--no-svelte` |  | no | Do not format Svelte components | Options |
| `--staged` |  | no | Only format files that are staged in git, and stage them again | Files |
| `--changed` |  | yes: `--changed=<val>` | Only format files that differ from a branch or commit (default: the default branch) | Files |
| `--stdin-filepath` |  | yes: `--stdin-filepath=<val>` | Format standard input as this file and print the result | Files |
| `--ignore-path` |  | yes: `--ignore-path=<val>` | Read ignore patterns from these files (default: .gitignore, .prettierignore, .git/info/exclude) | Files |
| `--ignore-pattern` |  | yes: `--ignore-pattern=<val>` | Skip files that match this pattern | Files |
| `--with-node-modules` |  | no | Format files in node_modules too | Files |
| `--no-error-on-unmatched-pattern` |  | no | Do not fail when an argument matches no file | Files |
| `--ignore-unknown` | `-u` | no | Ignore files in an unknown language | Files |
| `--allow-unsupported` |  | no | Warn instead of failing when the language of a file is not supported | Files |
| `--list-files` |  | no | Print the files that would be formatted and exit | Files |
| `--cwd` |  | yes: `--cwd=<val>` | Set the working directory | Files |
| `--check` | `-c` | no | Do not write. Exit with 1 if a file needs formatting | Output |
| `--list-different` | `-l` | no | Do not write. Print the files that need formatting and exit with 1 if there are any | Output |
| `--log-level` |  | yes: `--log-level=<val>` | silent, error, warn, log (default), or debug | Output |
| `--format` | `-f` | yes: `--format=<val>` | With --doctor, print the report as json | Output |
| `--color` |  | no | Always use colors | Output |
| `--no-color` |  | no | Never use colors | Output |
| `--timing` |  | no | Print how long each phase took | Output |
| `--threads` |  | yes: `--threads=<val>` | Number of threads (default: one per CPU core) | Other |
| `--debug-check` |  | no | Do not write. Fail if formatting a file would change what it means | Other |
| `--no-script` |  | no | Run the formatter even if the project has a fmt script | Other |
| `--version` | `-v` | no | Print the version of Bun | Other |
| `--help` | `-h` | no | Print the common flags. With --all, every flag | Other |
| `--all` |  | no | With --help, print every flag | Other |
| `--help-all` |  | no | The same as --help --all | Other |
| `--write` | `-w` | no | Write the files. This is the default | Compatibility with Prettier |
| `--config-precedence` |  | yes: `--config-precedence=<val>` | cli-override (default), file-override, or prefer-file | Compatibility with Prettier |
| `--find-config-path` |  | yes: `--find-config-path=<val>` | Print the path of the config for a file and exit | Compatibility with Prettier |
| `--parser` |  | yes: `--parser=<val>` | Read every file with this parser. Without files, format standard input | Compatibility with Prettier |
| `--plugin` |  | yes: `--plugin=<val>` | Load these plugins | Compatibility with Prettier |
| `--require-pragma` |  | no | Only format files that start with a @format or @prettier comment | Compatibility with Prettier |
| `--check-ignore-pragma` |  | no | Skip files that start with a @noformat or @noprettier comment | Compatibility with Prettier |
| `--insert-pragma` |  | no | Put a @format comment at the top of formatted files | Compatibility with Prettier |
| `--range-start` |  | yes: `--range-start=<val>` | Only format the statements from this offset on | Compatibility with Prettier |
| `--range-end` |  | yes: `--range-end=<val>` | Only format the statements up to this offset | Compatibility with Prettier |
| `--cursor-offset` |  | yes: `--cursor-offset=<val>` | For standard input, print on stderr where this offset ends up | Compatibility with Prettier |
| `--experimental-ternaries` |  | no | Put the question mark of a ternary after the condition | Compatibility with Prettier |
| `--experimental-operator-position` |  | yes: `--experimental-operator-position=<val>` | end (default) or start | Compatibility with Prettier |
| `--jsx-bracket-same-line` |  | no | The old name of --bracket-same-line | Compatibility with Prettier |
| `--cache` |  | no | No effect. Every run formats every file | Compatibility with Prettier |
| `--cache-location` |  | yes: `--cache-location=<val>` | No effect | Compatibility with Prettier |
| `--cache-strategy` |  | yes: `--cache-strategy=<val>` | No effect | Compatibility with Prettier |
| `--experimental-cli` |  | no | No effect | Compatibility with Prettier |
| `--flavor` |  | yes: `--flavor=<val>` | Without a config file, format like prettier or like oxfmt | Compatibility with oxfmt |
| `--disable-nested-config` |  | no | Use the config file in the working directory for every file | Compatibility with oxfmt |
| `--migrate` |  | yes: `--migrate=<val>` | Not supported | Compatibility with oxfmt |
| `--lsp` |  | no | Not supported | Compatibility with oxfmt |

### `bun x` / `bunx`

Usage: `bunx [flags] <package><@version> [flags and arguments for the package]`. The help output is printed in a different format, so this table was transcribed by hand. Values are given as separate arguments in the help, for example `--cwd <path>`.

| Flag | Short | Takes value? | Description |
|---|---|---|---|
| `--bun` | | no | Force the command to run with Bun instead of Node.js |
| `--package` | `-p` | yes: `-p <package>` | Specify package to install when binary name differs from package name |
| `--no-install` | | no | Skip installation if package is not already installed |
| `--cwd` | | yes: `--cwd <path>` | Set the working directory |
| `--env-file` | | yes: `--env-file <file>` | Load environment variables from the specified file(s) |
| `--minimum-release-age` | | yes: `<seconds>` | Only install packages published at least N seconds ago (security feature) |
| `--registry` | | yes: `<url>` | Install from a specific registry |
| `--ca` | | yes: `<cert>` | Trust a Certificate Authority signing certificate during installation |
| `--cafile` | | yes: `<path>` | (same line as `--ca`) CA certificate file |
| `--trust` | | no | Run the lifecycle scripts of the package and of ALL of its dependencies during installation |
| `--ignore-scripts` | | no | Run no lifecycle scripts during installation |
| `--verbose` | | no | Enable verbose output during installation |
| `--silent` | | no | Suppress output during installation |

### `bun repl`

`bun repl --help` prints the `bun run` help verbatim, so the help documents no REPL-specific flags. Related: `bun --interactive` starts the Node.js-compatible REPL (observed: `Welcome to Bun v1.4.4 (Node.js-compatible REPL, node:repl v26.3.0)`).

### `bun exec`

Usage: `bun exec <script>` ("Execute a shell script directly from Bun"). The help lists no flags.

### Package-manager commands: shared flag set

`bun install --help` and `bun add --help` print the same 52 flags; the only difference is the wording of the `-F` and `-a` descriptions. The other package-manager commands print subsets of this list, plus their own extras.

**Add-only group.** The last 8 rows below are `-d/--dev`, `--optional`, `--peer`, `--save-prod`, `-E/--exact`, `-a/--analyze`, `--only-missing` and `--catalog`. This file calls them the *add-only group*, and the sections below refer to them by that name.

Unknown flags are rejected here, for example `error: bun install has no --bogus-flag flag.`

| Flag | Short | Takes value? | Description |
|---|---|---|---|
| `--config` | `-c` | yes: `--config=<val>` | Specify path to config file (bunfig.toml) |
| `--yarn` | `-y` | no | Write a yarn.lock file (yarn v1) |
| `--production` | `-p` | no | Don't install devDependencies |
| `--no-save` |  | no | Don't update package.json or save a lockfile |
| `--save` |  | no | Save to package.json (true by default) |
| `--ca` |  | yes: `--ca=<val>` | Provide a Certificate Authority signing certificate |
| `--cafile` |  | yes: `--cafile=<val>` | The same as `--ca`, but is a file path to the certificate |
| `--dry-run` |  | no | Perform a dry run without making changes |
| `--frozen-lockfile` |  | no | Disallow changes to lockfile |
| `--force` | `-f` | no | Always request the latest versions from the registry & reinstall all dependencies |
| `--cache-dir` |  | yes: `--cache-dir=<val>` | Store & load cached data from a specific directory path |
| `--no-cache` |  | no | Ignore manifest cache entirely |
| `--silent` |  | no | Don't log anything |
| `--quiet` |  | no | Only show tarball name when packing |
| `--verbose` |  | no | Excessively verbose logging |
| `--no-progress` |  | no | Disable the progress bar |
| `--no-summary` |  | no | Don't print a summary |
| `--no-verify` |  | no | Skip verifying integrity of newly downloaded packages |
| `--offline` |  | no | Never touch the network: resolve and install only from the local cache |
| `--prefer-offline` |  | no | Use cached package metadata regardless of age; only fetch what is missing |
| `--ignore-scripts` |  | no | Skip lifecycle scripts for all packages, including the project's package.json and trusted dependencies |
| `--trust` |  | no | Add to trustedDependencies in the project's package.json and install the package(s) |
| `--global` | `-g` | no | Install globally |
| `--cwd` |  | yes: `--cwd=<val>` | Set a specific cwd |
| `--env-file` |  | yes: `--env-file=<val>` | Load environment variables from the specified file(s) |
| `--no-env-file` |  | no | Disable automatic loading of .env files |
| `--backend` |  | yes: `--backend=<val>` | Platform-specific optimizations for installing dependencies. Possible values: "hardlink" (default), "symlink", "copyfile" |
| `--registry` |  | yes: `--registry=<val>` | Use a specific registry by default, overriding .npmrc, bunfig.toml and environment variables |
| `--concurrent-scripts` |  | yes: `--concurrent-scripts=<val>` | Maximum number of concurrent jobs for lifecycle scripts (default: 2x CPU cores) |
| `--network-concurrency` |  | yes: `--network-concurrency=<val>` | Maximum number of concurrent network requests (default 64) |
| `--save-text-lockfile` |  | no | Save a text-based lockfile |
| `--omit` |  | yes: `--omit=<val>` | Exclude 'dev', 'optional', or 'peer' dependencies from install |
| `--lockfile-only` |  | no | Generate a lockfile without installing dependencies |
| `--linker` |  | yes: `--linker=<val>` | Linker strategy (one of "isolated" or "hoisted") |
| `--minimum-release-age` |  | yes: `--minimum-release-age=<val>` | Only install packages published at least N seconds ago (security feature) |
| `--minimum-release-age-excludes` |  | yes: `--minimum-release-age-excludes=<val>` | Packages exempt from --minimum-release-age (comma-separated or repeated; replaces the bunfig.toml list) |
| `--cpu` |  | yes: `--cpu=<val>` | Override CPU architecture for optional dependencies (e.g., x64, arm64, \* for all) |
| `--os` |  | yes: `--os=<val>` | Override operating system for optional dependencies (e.g., linux, darwin, \* for all) |
| `--libc` |  | yes: `--libc=<val>` | Override libc for optional dependencies (e.g., glibc, musl, \* for all) |
| `--use-system-ca` |  | no | Use the system's trusted certificate authorities |
| `--use-openssl-ca` |  | no | Use OpenSSL's default CA store |
| `--use-bundled-ca` |  | no | Use bundled CA store |
| `--help` | `-h` | no | Print this help menu |
| `--dev` | `-d` | no | Add dependency to "devDependencies" |
| `--optional` |  | no | Add dependency to "optionalDependencies" |
| `--peer` |  | no | Add dependency to "peerDependencies" |
| `--save-prod` |  | no | Add dependency to "dependencies", also when another group lists it |
| `--exact` | `-E` | no | Add the exact version instead of the ^range |
| `--filter` | `-F` | yes: `--filter=<val>` | Install packages for the matching workspaces |
| `--analyze` | `-a` | no | Analyze & install all dependencies of files passed as arguments recursively (using Bun's bundler) |
| `--only-missing` |  | no | Only add dependencies to package.json if they are not already present |
| `--catalog` |  | yes: `--catalog=<val>` | Add the resolved version to the root package.json catalog and depend on it as "catalog:" (use --catalog=NAME for a named catalog) |

### `bun install` (alias `i`; undocumented alias `ci`)

Usage: `bun install [flags] <name>@<version>`. It takes the full shared set above. `bun ci` prints the install help and ran an install. Whether `ci` implies `--frozen-lockfile` was **not verified**.

### `bun add` (alias `a`)

Usage: `bun add [flags] <package><@version>`. It takes the full shared set. Its `-F` description reads "Add the package(s) to the matching workspaces instead of the current package".

### `bun remove` (aliases `rm`, `r`, `uninstall`)

Usage: `bun remove [flags] [<packages>]`. It takes the shared set **without** the add-only group. The `-F` description is changed:

| Flag | Short | Takes value? | Description |
|---|---|---|---|
| `--filter` | `-F` | yes: `--filter=<val>` | Remove the package(s) from the matching workspaces instead of the current package |

### `bun update` (alias `up`)

Usage: `bun update [flags] <name>@<version>`. It takes the shared set without `--optional`, `--peer`, `--save-prod`, `-a`, `--only-missing` and `--catalog`. It keeps `-d` and `-E` but describes them differently. The extra flags, and the flags with changed descriptions:

| Flag | Short | Takes value? | Description |
|---|---|---|---|
| `--production` | `-p` | no | Only update dependencies and optionalDependencies (alias: --prod) |
| `--latest` | `-L` | no | Update packages to their latest versions, ignoring the ranges in package.json |
| `--interactive` | `-i` | no | Show an interactive list of outdated packages to select for update |
| `--filter` | `-F` | yes: `--filter=<val>` | Update packages for the matching workspaces |
| `--recursive` | `-r` | no | Update packages in all workspaces |
| `--dev` | `-d` | no | Only update devDependencies |
| `--no-optional` |  | no | Don't update optionalDependencies |
| `--depth` |  | yes: `--depth=<val>` | Only 0 is accepted: update direct dependencies and keep transitive dependencies at their locked versions |
| `--exact` | `-E` | no | Write exact versions to package.json instead of ^ or ~ ranges |

The help examples also use `bun update --prod` (alias of `-p`), `bun update '@types/*'` and `bun update '!webpack'`; patterns and `!` negation are accepted as package arguments.

### `bun audit`

Usage: `bun audit [flags]`, plus the sub-mode `bun audit fix`. It does not use the shared set. Its complete list:

| Flag | Short | Takes value? | Description |
|---|---|---|---|
| `--audit-level` |  | yes: `--audit-level=<val>` | Only print advisories with severity greater than or equal to &lt;level> (low, moderate, high, critical) |
| `--production` | `-p` | no | Skip packages that are only needed by devDependencies (alias: --prod) |
| `--omit` |  | yes: `--omit=<val>` | Skip packages that are only needed by the given dependency types: dev, optional, or peer (repeatable) |
| `--ignore` |  | yes: `--ignore=<val>` | Ignore advisories by GHSA or numeric advisory ID (repeatable) |
| `--json` |  | no | Output in JSON format |
| `--dry-run` |  | no | Show what bun audit fix would change without changing anything |
| `--latest` | `-L` | no | Also apply fixes your declared ranges exclude, rewriting package.json |
| `--cwd` |  | yes: `--cwd=<val>` | Set a specific cwd |
| `--help` | `-h` | no | Print this help menu |

### `bun dedupe`

Usage: `bun dedupe [flags]`. Its complete list:

| Flag | Short | Takes value? | Description |
|---|---|---|---|
| `--check` |  | no | Exit with code 1 if the lockfile has duplicate versions that can be removed, without changing anything |
| `--dry-run` |  | no | Print the duplicate versions that would be removed without changing anything |
| `--lockfile-only` |  | no | Rewrite bun.lock without installing |
| `--frozen-lockfile` |  | no | Fail instead of rewriting bun.lock when duplicate versions can be removed |
| `--linker` |  | yes: `--linker=<val>` | Install with the given linker (one of "isolated" or "hoisted") |
| `--silent` |  | no | Don't log anything |
| `--cwd` |  | yes: `--cwd=<val>` | Set a specific cwd |
| `--help` | `-h` | no | Print this help menu |

### `bun prune`

Usage: `bun prune [flags]`. Its complete list:

| Flag | Short | Takes value? | Description |
|---|---|---|---|
| `--production` | `-p` | no | Also remove packages that are only needed by devDependencies (alias: --prod) |
| `--omit` |  | yes: `--omit=<val>` | Also remove packages that are only needed by the given dependency types |
| `--check` |  | no | Exit with code 1 if node_modules has packages that can be removed, without deleting anything |
| `--dry-run` |  | no | Print what would be removed without deleting anything |
| `--os` |  | yes: `--os=<val>` | Prune for a different operating system than the current one |
| `--cpu` |  | yes: `--cpu=<val>` | Prune for a different CPU architecture than the current one |
| `--libc` |  | yes: `--libc=<val>` | Prune for a different libc than the current one |
| `--linker` |  | yes: `--linker=<val>` | Linker to assume when node_modules mixes isolated and hoisted installs (one of "isolated" or "hoisted") |
| `--filter` | `-F` | yes: `--filter=<val>` | Only prune the node_modules folders of the matching workspaces |
| `--silent` |  | no | Don't log anything |
| `--cwd` |  | yes: `--cwd=<val>` | Set a specific cwd |
| `--help` | `-h` | no | Print this help menu |

### `bun outdated`

Usage: `bun outdated [flags] [filter]`. It takes the shared set without the add-only group. Extra or changed flags:

| Flag | Short | Takes value? | Description |
|---|---|---|---|
| `--filter` | `-F` | yes: `--filter=<val>` | Display outdated dependencies for each matching workspace |
| `--recursive` | `-r` | no | Check outdated packages in all workspaces |

### `bun link` / `bun unlink`

Usage: `bun link [flags] [<packages>]` and `bun unlink [flags]`. They take the shared set without the add-only group and without `-F/--filter`. `--save` and `--no-save` have inverted defaults here:

| Flag | Short | Takes value? | Description |
|---|---|---|---|
| `--no-save` |  | no | Don't update package.json or save a lockfile (the default) |
| `--save` |  | no | Update package.json and save a lockfile (false by default) |

### `bun publish`

Usage: `bun publish [flags] [dist]`. It takes the shared set without the add-only group. Extra or changed flags:

| Flag | Short | Takes value? | Description |
|---|---|---|---|
| `--access` |  | yes: `--access=<val>` | Set access level for scoped packages |
| `--tag` |  | yes: `--tag=<val>` | Tag the release. Default is "latest" |
| `--otp` |  | yes: `--otp=<val>` | Provide a one-time password for authentication |
| `--auth-type` |  | yes: `--auth-type=<val>` | Specify the type of one-time password authentication (default is 'web') |
| `--gzip-level` |  | yes: `--gzip-level=<val>` | Specify a custom compression level for gzip. Default is 9. |
| `--tolerate-republish` |  | no | Don't exit with code 1 when republishing over an existing version number |
| `--filter` | `-F` | yes: `--filter=<val>` | Publish each matching workspace package |
| `--recursive` | `-r` | no | Publish every workspace package whose version is not on the registry |

### `bun patch` / `bun patch-commit`

Usage: `bun patch [flags or options] <package>@<version>` and `bun patch-commit [flags or options] <directory>`. Both take the shared set without the add-only group and without `-F/--filter`. Extras for `patch`:

| Flag | Short | Takes value? | Description |
|---|---|---|---|
| `--commit` |  | no | Install a package containing modifications in `dir` |
| `--patches-dir` |  | yes: `--patches-dir=<val>` | The directory to put the patch file in (only if --commit is used) |

`patch-commit` only adds `--patches-dir=<val>` ("The directory to put the patch file").

### `bun info`

Usage: `bun info [flags] <package>[@<version>] [<property>...]`. It takes the shared set without the add-only group and without `-F`. Extra flags:

| Flag | Short | Takes value? | Description |
|---|---|---|---|
| `--json` |  | no | Output in JSON format |

`bun view` is **not** an alias in 1.4.4; it gives `Script not found "view"`. `bun pm view` exists.

### `bun why`

Usage: `bun why [flags] <package>`. It takes the shared set without the add-only group and without `-F`. Extra flags:

| Flag | Short | Takes value? | Description |
|---|---|---|---|
| `--top` |  | no | Show only the top dependency tree instead of nested ones |
| `--depth` |  | yes: `--depth=<val>` | Maximum depth of the dependency tree to display |

### `bun pm`

Usage: `bun pm [flags] [<command>]`. `bun pm --help` lists no top-level flags of its own. Every `bun pm <sub> --help` was tried; each prints this same generic pm help, so the tree below is the only per-subcommand documentation. Flags are listed as the help shows them; the help gives no `=<val>` hints.

| pm subcommand | Arguments / flags (from help) | Description |
|---|---|---|
| `pm scan` | | Scan all packages in lockfile for security vulnerabilities |
| `pm pack` | `--dry-run`, `--destination`, `--filename`, `--ignore-scripts`, `--gzip-level` (0-9, default 9), `--quiet` | Create a tarball of the current workspace |
| `pm bin` | `-g` | Print the path to the bin folder (`-g`: global bin folder) |
| `pm ls` | `names ...`, `--all`, `--trusted`, `--prod`, `-g` | List the tree of installed dependencies |
| `pm why <pkg>` | | Show the dependency tree explaining why a package is installed |
| `pm diff [a] [b]` | `--stat`, `--name-only`, `-U n` (context lines, default 3), `--json`; `pkg@ver:subpath` syntax | Show what changed between two versions of a package (or vs a folder/tarball) |
| `pm licenses` | `--json`, `--prod`, `--dev`, `--long`, `--filter <pattern>` | List installed packages grouped by license |
| `pm whoami` | | Print the current npm username |
| `pm view name[@version] [property ...]` | | View package metadata from the registry (help says to use `bun info` instead) |
| `pm version [increment]` | `patch`, `minor`, `major`, `prepatch`, `preminor`, `premajor`, `prerelease`, `from-git`, or a specific version | Bump the version in package.json and create a git tag |
| `pm pkg` | `get [key ...]`, `set key=value ...`, `delete key ...`, `fix` | Manage data in package.json |
| `pm hash` | | Generate & print the hash of the current lockfile |
| `pm hash-string` | | Print the string used to hash the lockfile |
| `pm hash-print` | | Print the hash stored in the current lockfile |
| `pm cache` | | Print the path to the cache folder |
| `pm cache rm` | `--dry-run` | Clear the cache |
| `pm cache prune` | `--max-age <days>` (default 30), `--dry-run` | Remove packages older than 30 days |
| `pm cache pack\|unpack file` | | Save / restore the cache entries this lockfile needs as one file (for CI caches) |
| `pm fetch` | | Download all dependencies into the cache without installing |
| `pm migrate` | | Migrate another package manager's lockfile without installing anything |
| `pm untrusted` | | Print current untrusted dependencies with scripts |
| `pm trust names ...` | `--all`, `--dry-run` | Run scripts for untrusted dependencies and add them to `trustedDependencies` |
| `pm default-trusted` | | Print the default trusted dependencies list |

Not verified: whether `bun pm` subcommands also accept the shared package-manager flags, such as `--cwd`. The help does not say.

### `bun build`

Usage: `bun build [flags] <entrypoint>`. The help ends with "A full list of flags is available at https://bun.com/docs/bundler", so the list below may be incomplete. Runtime transpiler flags are also honoured: `bun build --define MYDEF:42` was confirmed to inline the value. `-e` means `--external` here, but `--eval` in the runtime.

The help text for `--no-module-preload` is printed with a gap ("don't emit  for the chunks"); the HTML tag in it appears to be stripped in the binary's output.

| Flag | Short | Takes value? | Description |
|---|---|---|---|
| `--production` |  | no | Set NODE_ENV=production and enable minification |
| `--compile` |  | no | Generate a standalone Bun executable containing your bundled code. Implies --production |
| `--compile-exec-argv` |  | yes: `--compile-exec-argv=<val>` | Prepend arguments to the standalone executable's execArgv |
| `--bytecode-order` |  | yes: `--bytecode-order=<val>` | With --compile --bytecode: lay the bytecode out by order file(s) a run of the executable wrote (BUN_BYTECODE_ORDER_OUT); comma-separated or repeated, most important first |
| `--compile-jit-policy` |  | yes: `--compile-jit-policy=<val>` | JIT tier-up threshold scale the executable starts with (default 1 = normal; see Bun.unsafe.setJITPolicy) |
| `--compile-autoload-dotenv` |  | no | Enable autoloading of .env files in standalone executable (default: true) |
| `--no-compile-autoload-dotenv` |  | no | Disable autoloading of .env files in standalone executable |
| `--compile-autoload-bunfig` |  | no | Enable autoloading of bunfig.toml in standalone executable (default: true) |
| `--no-compile-autoload-bunfig` |  | no | Disable autoloading of bunfig.toml in standalone executable |
| `--compile-autoload-tsconfig` |  | no | Enable autoloading of tsconfig.json at runtime in standalone executable (default: false) |
| `--no-compile-autoload-tsconfig` |  | no | Disable autoloading of tsconfig.json at runtime in standalone executable |
| `--compile-autoload-package-json` |  | no | Enable autoloading of package.json at runtime in standalone executable (default: false) |
| `--no-compile-autoload-package-json` |  | no | Disable autoloading of package.json at runtime in standalone executable |
| `--compile-executable-path` |  | yes: `--compile-executable-path=<val>` | Path to a Bun executable to use for cross-compilation instead of downloading |
| `--asset` |  | yes: `--asset=<val>` | Embed a file or directory into the compiled executable, preserving its relative path (requires --compile) |
| `--bytecode` |  | no | Use a bytecode cache |
| `--bytecode-depth` |  | yes: `--bytecode-depth=<val>` | How many levels of nested functions to compile to bytecode ahead of time. Defaults to all |
| `--no-optimize-bytecode` |  | no | With --bytecode: skip the build-time bytecode optimization passes |
| `--watch` |  | no | Automatically restart the process on file change |
| `--no-clear-screen` |  | no | Disable clearing the terminal screen on reload when --watch is enabled |
| `--target` |  | yes: `--target=<val>` | The intended execution environment for the bundle. "browser", "bun" or "node" |
| `--outdir` |  | yes: `--outdir=<val>` | Default to "dist" if multiple files |
| `--outfile` |  | yes: `--outfile=<val>` | Write to a file |
| `--metafile` |  | yes: `--metafile=<val>` | Write a JSON file with metadata about the build |
| `--metafile-md` |  | yes: `--metafile-md=<val>` | Write a markdown file with a visualization of the module graph (LLM-friendly) |
| `--sourcemap` |  | yes: `--sourcemap=<val>` | Build with sourcemaps - 'linked', 'inline', 'external', or 'none' |
| `--banner` |  | yes: `--banner=<val>` | Add a banner to the bundled output such as "use client"; for a bundle being used with RSCs |
| `--footer` |  | yes: `--footer=<val>` | Add a footer to the bundled output such as // built with bun! |
| `--format` |  | yes: `--format=<val>` | Specifies the module format to build to. "esm", "cjs" and "iife" are supported. Defaults to "esm", or "cjs" with --bytecode. |
| `--root` |  | yes: `--root=<val>` | Root directory used for multiple entry points |
| `--splitting` |  | no | Enable code splitting |
| `--no-split-require` |  | no | With --splitting and --target bun: keep a require()'d ESM file in the calling chunk instead of emitting a chunk loaded at the call |
| `--no-module-preload` |  | no | With --splitting and --target browser: don't emit  for the chunks an entry or import() loads |
| `--min-chunk-size` |  | yes: `--min-chunk-size=<val>` | With --splitting, also fold side-effect-free chunks smaller than this many source bytes into a chunk more entry points load. Default: 0 (off); 16384 is a good value for browser builds |
| `--public-path` |  | yes: `--public-path=<val>` | A prefix to be appended to any import paths in bundled code |
| `--external` | `-e` | yes: `--external=<val>` | Exclude module from transpilation (can use \* wildcards). ex: -e react |
| `--allow-unresolved` |  | yes: `--allow-unresolved=<val>` | Allow unresolved dynamic import()/require() specifiers matching these glob patterns. Use '&lt;empty>' for opaque specifiers. Default is '\*' (allow all). |
| `--reject-unresolved` |  | no | Fail the build on any dynamic import()/require() specifier that cannot be resolved at build time. |
| `--packages` |  | yes: `--packages=<val>` | Add dependencies to bundle or keep them external. "external", "bundle" is supported. Defaults to "bundle". |
| `--entry-naming` |  | yes: `--entry-naming=<val>` | Customize entry point filenames. Defaults to "[dir]/[name].[ext]" |
| `--chunk-naming` |  | yes: `--chunk-naming=<val>` | Customize chunk filenames. Defaults to "[name]-[hash].[ext]" |
| `--asset-naming` |  | yes: `--asset-naming=<val>` | Customize asset filenames. Defaults to "[name]-[hash].[ext]" |
| `--react-fast-refresh` |  | no | Enable React Fast Refresh transform (does not emit hot-module code, use this for testing) |
| `--react-compiler` |  | no | Enable the React Compiler optimizing transform |
| `--no-bundle` |  | no | Transpile file only, do not bundle |
| `--check` |  | no | Type check the entry points and what they import. Nothing is bundled if there are type errors |
| `--emit-dce-annotations` |  | no | Re-emit DCE annotations in bundles. Enabled by default unless --minify-whitespace is passed. |
| `--no-deprecated-namespace-object-setters` |  | no | Make bundled module namespace objects getter-only (the default in a future release) |
| `--minify` |  | no | Enable all minification flags |
| `--minify-syntax` |  | no | Minify syntax and inline data |
| `--minify-whitespace` |  | no | Minify whitespace |
| `--minify-identifiers` |  | no | Minify identifiers |
| `--keep-names` |  | no | Preserve original function and class names when minifying |
| `--css-chunking` |  | no | Chunk CSS files together to reduce duplicated CSS loaded in a browser. Only has an effect when multiple entrypoints import CSS |
| `--conditions` |  | yes: `--conditions=<val>` | Pass custom conditions to resolve |
| `--app` |  | no | (EXPERIMENTAL) Build a web app for production using Bun Bake. |
| `--env` |  | yes: `--env=<val>` | Inline environment variables into the bundle as process.env.${name}. Defaults to 'disable'. To inline environment variables matching a prefix, use my prefix like 'FOO_PUBLIC_\*'. |
| `--windows-hide-console` |  | no | When using --compile targeting Windows, prevent a Command prompt from opening alongside the executable |
| `--windows-icon` |  | yes: `--windows-icon=<val>` | When using --compile targeting Windows, assign an executable icon |
| `--windows-title` |  | yes: `--windows-title=<val>` | When using --compile targeting Windows, set the executable product name |
| `--windows-publisher` |  | yes: `--windows-publisher=<val>` | When using --compile targeting Windows, set the executable company name |
| `--windows-version` |  | yes: `--windows-version=<val>` | When using --compile targeting Windows, set the executable version (e.g. 1.2.3.4) |
| `--windows-description` |  | yes: `--windows-description=<val>` | When using --compile targeting Windows, set the executable description |
| `--windows-copyright` |  | yes: `--windows-copyright=<val>` | When using --compile targeting Windows, set the executable copyright |

### `bun init`

Usage: `bun init [flags] [<folder>]`. Transcribed by hand, because `--react` takes an optional inline value:

| Flag | Short | Takes value? | Description |
|---|---|---|---|
| `--help` | | no | Print this menu (note: no `-h` listed) |
| `--yes` | `-y` | no | Accept all default options |
| `--minimal` | `-m` | no | Only initialize type definitions |
| `--react` | `-r` | optional: `--react=tailwind` or `--react=shadcn` | Initialize a React project (with TailwindCSS / @shadcn/ui and TailwindCSS) |

### `bun create` (alias `c`)

Usage: `bun create <MyReactComponent.(jsx|tsx)>`, `bun create <template> [...flags] dest`, or `bun create <github-org/repo> [...flags] dest`. **The help lists no flags.** It only documents these environment variables:

- `GITHUB_TOKEN`
- `GITHUB_API_DOMAIN`
- `NPM_CLIENT`
- `BUN_CREATE_DIR`

The strings `--force`, `--no-install`, `--no-git` and `--open` exist in the binary, but nothing ties them to `create`, so they are **unverified**. An npm template runs `bunx create-<template>` with the given arguments.

### `bun upgrade`

Usage: `bun upgrade [flags]`. The help has no flags table; the example shows `bun upgrade --canary`. The binary also contains the message "To downgrade to the latest stable release, run bun upgrade --stable". It was not run, because it would modify the installation.

### `bun completions`, `bun getcompletes`, `bun discord`, `bun help`

None of these lists any flags.

---

## Reserved names for wrappers

### Single-dash short flags in use

| Short | Meaning in `bun` / `bun run` (runtime) | Other meanings in subcommands |
|---|---|---|
| `-a` | | `--analyze` (install/add) |
| `-b` | `--bun` | `--build` (check) |
| `-c` | `--config` | `--config` (PM commands), `--check` (fmt) |
| `-d` | `--define` | `--dev` (install/add/update) |
| `-e` | `--eval` | `--external` (build) |
| `-f` | | `--force` (PM commands), `--format` (fmt) |
| `-g` | | `--global` (PM commands; also `pm bin -g`, `pm ls -g`) |
| `-h` | `--help` | `--help` everywhere (not listed for `init`) |
| `-i` | auto-install (`--install=fallback`), no long form | `--interactive` (update) |
| `-l` | `--loader` | `--list-different` (fmt) |
| `-m` | | `--minimal` (init) |
| `-p` | `--print` | `--production` (PM), `--project` (check), `--package` (bunx) |
| `-r` | `--preload` | `--recursive` (update/outdated/publish), `--react` (init) |
| `-t` | | `--test-name-pattern` (test) |
| `-u` | | `--update-snapshots` (test), `--ignore-unknown` (fmt) |
| `-v` | `--version` (top level only) | `--version` (fmt) |
| `-w` | | `--write` (fmt) |
| `-y` | | `--yarn` (PM commands), `--yes` (init) |
| `-E` | | `--exact` (install/add/update) |
| `-F` | `--filter` | `--filter` (PM commands, prune, publish) |
| `-L` | | `--latest` (update, audit) |
| `-U` | | context lines (`pm diff -U n`) |

- **Short flags unused at the top level** (`bun -X file`): every letter not in the runtime column, for example `-a -f -g -m -t -u -w -y` and most capitals. Bun rejects these rather than ignoring them: `bun -Z` fails with `error: Invalid Argument '-Z'` and exit code 1. A wrapper can claim them only if it removes them before forwarding argv to bun.
- **Lowercase letters unused anywhere:** `-j -k -n -o -q -s -x -z`.

### Subcommand names and aliases (first positional argument)

- **Built-in:** `run test check fmt x repl exec install i add a remove rm update audit dedupe prune outdated link unlink publish patch patch-commit pm info why build init create c upgrade`
- **Undocumented:** `r uninstall up ci list whoami bun completions getcompletes discord help`
- **Reserved:** `deploy cloud config use auth login logout`
- **Separate binary name:** `bunx`. `bunx --help` and `bun x --help` print identical text.

Built-in names take precedence over package.json scripts. Tested: with a script called `build`, `bun build` runs the bundler, and only `bun run build` runs the script.

### How bun treats the first positional argument (tested)

These tests used a scratch project. It had scripts `@foo`, `:foo`, `+foo`, `foo`, `foo:bar`, `both`, `build`, `prefoo` and `postfoo`; files `both.ts`, `both` and `hello.ts`; and `node_modules/.bin/{mybin,both,zed}` next to `zed.ts`.

| argv | Without package.json | With a matching package.json script |
|---|---|---|
| `bun @foo` | `error: Script not found "@foo"` (exit 1) | runs script `@foo` |
| `bun :foo` | `error: Script not found ":foo"` (exit 1) | runs script `:foo` |
| `bun +foo` | `error: Script not found "+foo"` (exit 1) | runs script `+foo` |
| `bun foo:bar` | `Script not found` | runs script `foo:bar` |
| `bun @scope/pkg` | `Script not found "@scope/pkg"`; **not** auto-run via bunx | |
| `bun %foo`, `#foo`, `^foo`, `~foo`, `=foo`, `!foo`, `node:fs` | all `Script not found "<arg>"` (exit 1) | |
| `bun foo` | `Script not found "foo"` | runs `prefoo`, then `foo`, then `postfoo` (npm-style pre/post hooks) |
| `bun foo.ts`, `bun ./foo` | `error: Module not found "<arg>"` | |
| `bun foo@1.0.0` | `error: File not found "foo@1.0.0"` (an argument containing `.` is treated as a path) | |
| `bun http://127.0.0.1:9/x.js` | `error: Module not found "http://..."` (a URL is treated as a module specifier) | |
| `bun -` | reads the program from **stdin** (`echo 'console.log(1)' \| bun -` printed `1`) | |

The following were also tested:

- **`@`, `:` and `+` have no special meaning** to bun as a prefix of the first argument. They are only matched against package.json script names, then files, then bins.
- **Resolution order for a bare word:**
  1. built-in subcommand;
  2. package.json script (a script `both` beat file `both`, file `both.ts` and `.bin/both`);
  3. file, with extension resolution (`bun hello` ran `hello.ts`; `bun zed` ran `zed.ts` rather than `.bin/zed`);
  4. `node_modules/.bin/<name>` (`bun mybin` ran the bin).
- **Flags after the entrypoint belong to the script.** `bun zed.ts --version -v --smol` passes all three in `process.argv` and bun does not interpret them. Bun's own flags must come before the entrypoint.
- **`--` handling:**
  - `bun --` with nothing else prints help (exit 0).
  - `bun -- zed` runs `zed`; the `--` shows up in `process.execArgv`.
  - A `--` directly after the entrypoint is dropped: `bun zed -- x` gives argv `["x"]`.
  - A later `--` is kept: `bun zed a -- x` gives `["a","--","x"]`.
- **Unknown flags:**
  - `bun`, `bun run`, `bun test` and `bun build` silently accept unknown **long** flags placed before the entrypoint (`bun --nonexistent-flag zed` runs and leaves `--nonexistent-flag` in `process.execArgv`). `bun --nonexistent-flag` alone prints help with exit 0.
  - Unknown **short** flags are errors (`Invalid Argument '-Z'`, exit 1).
  - `install`, `add`, `fmt` and `check` reject unknown long flags (tested). The other package-manager commands were not tested.
- **Repeated `-e`:** the last one wins (`bun -e 'console.log(1)' -e 'console.log(2)'` printed `2`).
- **Environment variables:**
  - `BUN_OPTIONS` adds flags as if they were on the command line. `BUN_OPTIONS="--preload ./x.ts" bun file` preloaded `x.ts`, and the flags appear in `process.execArgv`.
  - `BUN_BE_BUN=1` is the variable flowscript uses to make its compiled executable behave like the `bun` CLI. Its effect on a `--compile` binary was not re-tested here.
  - Other variables named by the help: `BUN_FEATURE_FLAG_EXPERIMENTAL_HTTP2_CLIENT`, `BUN_FEATURE_FLAG_EXPERIMENTAL_HTTP3_CLIENT`, `BUN_BYTECODE_ORDER_OUT`, `GITHUB_TOKEN`, `GITHUB_API_DOMAIN`, `NPM_CLIENT`, `BUN_CREATE_DIR` and `REDIS_URL`.

### Implications for a wrapper CLI

- A wrapper subcommand should not use any name from the subcommand lists above. A first argument that is not a built-in subcommand is resolved by bun as a package.json script, then a file, then a bin.
- Prefixes `@`, `:` and `+` are not interpreted by bun, but they are legal package.json script names. A wrapper that claims one of them would shadow scripts with that name, so `bun run <name>` would still be needed to reach them.
- Long flags are safest when namespaced, for example `--flowscript-*`. Bun's runtime silently swallows unknown long flags and forwards them into `process.execArgv`, so a collision would not raise an error. Every short flag bun uses at the top level is listed above, and any other short flag makes bun exit with an error.
