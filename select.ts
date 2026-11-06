// a tiny picker built on ANSI escape codes and stdin raw mode
// it draws on stderr so stdout stays free for the selected value

export type SelectOption<T> = { label: string; value: T };

export async function select<T>(title: string, options: SelectOption<T>[]): Promise<T | undefined> {
  if (!process.stdin.isTTY) {
    console.error(`${title} An interactive terminal is required to choose between ${options.length} options.`);
    return undefined;
  }

  let cursor = 0;

  const render = () => {
    const lines = options.map((o, i) => i === cursor ? `\x1b[36m> ${o.label}\x1b[0m` : `  ${o.label}`);
    process.stderr.write([title, ...lines].join("\n") + "\n");
  };
  const clear = () => process.stderr.write(`\x1b[${options.length + 1}A\x1b[J`);

  return new Promise(resolve => {
    const onData = (data: Buffer) => {
      const key = data.toString();

      if (key === "\x1b[A") cursor = (cursor - 1 + options.length) % options.length;
      else if (key === "\x1b[B") cursor = (cursor + 1) % options.length;
      else if (key === "\r" || key === "\x1b" || key === "\x03") {
        clear();
        process.stdin.off("data", onData);
        process.stdin.setRawMode(false);
        process.stdin.pause();
        return resolve(key === "\r" ? options[cursor]!.value : undefined);
      }

      clear();
      render();
    };

    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on("data", onData);
    render();
  });
}
