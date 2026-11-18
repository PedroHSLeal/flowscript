import { describe, expect, test } from "bun:test";
import { parseArgs } from "./cli";

describe("parseArgs", () => {
  test("no args goes to bun", () => {
    expect(parseArgs([])).toEqual({ kind: "bun", args: [] });
  });

  test("plain bun calls pass through untouched", () => {
    for (const argv of [
      ["run", "dev"],
      ["script.ts", "@foo", ":list"],
      ["add", "@types/node"],
      ["x", "@biomejs/biome", "check"],
      ["--smol", "run", "script.ts", "@arg"],
      ["--preload", "@scope/pkg", "script.ts"],
      ["--", "@editor"],
    ]) {
      expect(parseArgs(argv)).toEqual({ kind: "bun", args: argv });
    }
  });

  test("runs a workflow", () => {
    expect(parseArgs(["@editor"])).toEqual({ kind: "workflow", name: "editor", bunArgs: [], args: [] });
  });

  test("workflow keeps bun flags before it and args after it", () => {
    expect(parseArgs(["--smol", "--watch", "@editor", "a", "--b", "@c"])).toEqual({
      kind: "workflow",
      name: "editor",
      bunArgs: ["--smol", "--watch"],
      args: ["a", "--b", "@c"],
    });
  });

  test("skips the value of bun flags that take one", () => {
    expect(parseArgs(["--env-file", ".env", "--preload", "@scope/pkg", "@tools/editor", "x"])).toEqual({
      kind: "workflow",
      name: "tools/editor",
      bunArgs: ["--env-file", ".env", "--preload", "@scope/pkg"],
      args: ["x"],
    });
    expect(parseArgs(["--env-file=.env", "@editor"])).toMatchObject({ kind: "workflow", bunArgs: ["--env-file=.env"] });
  });

  test("bare @ is an error", () => {
    expect(parseArgs(["@"]).kind).toBe("error");
  });

  test("commands and aliases", () => {
    expect(parseArgs([":list"])).toEqual({ kind: "command", name: "list", args: [] });
    expect(parseArgs([":ls"])).toEqual({ kind: "command", name: "list", args: [] });
    expect(parseArgs([":goto", "editor"])).toEqual({ kind: "command", name: "goto", args: ["editor"] });
    expect(parseArgs([":cd"])).toEqual({ kind: "command", name: "goto", args: [] });
    expect(parseArgs([":help"])).toEqual({ kind: "command", name: "help", args: [] });
  });

  test("unknown command is an error", () => {
    expect(parseArgs([":nope"]).kind).toBe("error");
  });

  test("commands must come first", () => {
    expect(parseArgs(["--smol", ":list"]).kind).toBe("error");
  });
});
