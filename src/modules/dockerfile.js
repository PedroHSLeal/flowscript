export async function checkIfDockerfileExists(filePath) {
	return Bun.file(filePath).exists();
}
