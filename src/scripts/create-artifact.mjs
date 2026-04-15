import { $ } from "bun";

await main();

async function main() {
  const argv = Bun.argv;

  await execute("alguma-coisa")
}

async function execute(app) {
  const outputList = await $`ls -l $(pwd)\\src\\shortcuts`.text();

  if (!outputList.includes(app)) {
    console.log(`o shortcut '${app}' nao existe :(... vou criar agora!`);

    await $`mkdir $(pwd)\\src\\shortcuts\\${app}`;
    await $`touch $(pwd)\\src\\shortcuts\\${app}\\index.mjs`;
    await $`touch $(pwd)\\src\\shortcuts\\${app}\\Dockerfile`;
  }
}
