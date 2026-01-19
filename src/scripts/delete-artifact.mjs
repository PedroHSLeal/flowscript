import { $ } from "bun";
import { args } from "../utils";

$.nothrow();

const { values } = args({
	shortcut: { type: "string" },
	all: { type: "boolean" }
});

if (values.all) {
	await $`podman kill --all`;
	await $`podman rm --all`;
}
else {
	await $`podman kill ${values.shortcut}`;
	await $`podman container rm ${values.shortcut}`;
}
