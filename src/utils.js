import { $ } from "bun";
import { parseArgs } from "util";

export async function checkIfArtifactExists(artifact, shortcut) {
	const artifactList = await $`podman ${artifact} list`.text();
	return artifactList.includes(shortcut);
}

export function args(flags) {
	return parseArgs({
		args: Bun.argv,
		options: flags,
		strict: true,
		allowPositionals: true,
	});
}
