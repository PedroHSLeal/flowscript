import { $ } from "bun";

$.nothrow();

await $`podman kill --all`;
await $`podman rm --all`;
await $`podman image rm --all`;