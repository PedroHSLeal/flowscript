import { $ } from "bun";
import { args } from "../utils";

$.nothrow();

await $`podman kill --all`;