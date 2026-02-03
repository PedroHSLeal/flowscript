import { $ } from "bun";
import { exec, execFile, spawn } from "node:child_process";

// await $`cmd /k .\\src\\scripts\\seila.cmd`
// aqui abre o terminal, mantem aberto e executa o arquivo

// Bun.spawn(["cmd", "/k .\\src\\scripts\\seila.cmd"], {detached: true})
// await $`wt --maximized --focus new-tab --title opencode "podman run --interactive --tty --network intelligence irezin/opencode"`
// await $`C:\\Users\\henri\\AppData\\Local\\Microsoft\\WindowsApps\\wt.exe`;
// Bun.spawn(["C:\\Users\\henri\\AppData\\Local\\Microsoft\\WindowsApps\\wt.exe" ], { detached: true });
// await $`podman run --interactive --tty --network intelligence irezin/opencode`;

// Bun.spawn(["terminal", "--title=opencode", "echo asdf"], { detached: true, windowsHide: false, windowsVerbatimArguments: true, stdio: ["pipe", "pipe", "pipe"] });
// await $`terminal --maximized --focus new-tab --title opencode sleep 5 && echo asdf`; // FUNCIONOU
// spawn(`wt new-tab --title=opencode --profile Cmder --appendCommandLine=" sleep 1"`, { shell: true, detached: true, stdio: "ignore" });
// spawn(`wt new-tab --title=opencode --profile="Command Prompt" --appendCommandLine " /k sleep 5 && podman run --interactive --tty --network intelligence irezin/opencode"`, { shell: true, detached: true, windowsVerbatimArguments: true, stdio: "ignore" });
// spawn(`wt new-tab --title=opencode --profile Cmder --appendCommandLine " && podman machine list"`, { shell: true, detached: true, stdio: "ignore", windowsVerbatimArguments: false });
// spawn("%USERPROFILE%\\fun\\commands\\apps\\dockerzin\\src\\scripts\\seila", { shell: true, detached: true, stdio: "inherit" })

// Bun.spawn(["podman", "run", "--attach=stdout", "-it", "opencode"], { detached: true });