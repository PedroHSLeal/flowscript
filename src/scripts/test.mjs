import { $ } from "bun";

// await $`cmd /k .\\src\\scripts\\seila.cmd`
Bun.spawn(["cmd", "/k .\\src\\scripts\\seila.cmd"], {detached: true})