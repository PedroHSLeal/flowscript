import { $ } from "bun";

$.nothrow();

await $`podman kill --all`;