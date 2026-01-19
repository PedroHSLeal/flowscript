import { $ } from "bun";

$.nothrow();

const { exitCode } = await $`podman run --interactive --tty --volume .:/app --name aider paulgauthier/aider --set-env OLLAMA_API_BASE=http://127.0.0.1:11434`;

if (exitCode !== 0) {
    console.log("aider criado, rodando container...");
    await $`podman container start aider`;
}