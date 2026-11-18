import { describe, expect, test } from "bun:test";
import { parseArgs } from "./cli";

describe("parseArgs", () => {
  test("no args goes to bun", () => {
    expect(parseArgs([])).toEqual({ kind: "bun", args: [] });
  });

  test("plain bun calls pass through untouched", () => {
    for (const argv of [
      ["run", "dev"],
      ["script.ts", "---list", "---workflow", "x"],
      ["add", "@types/node"],
      ["x", "@biomejs/biome", "check"],
      ["--smol", "run", "script.ts", "---list"],
      ["--eval", "---list", "script.ts"],
      ["--", "---list"],
      ["-", "---list"],
    ]) {
      expect(parseArgs(argv)).toEqual({ kind: "bun", args: argv });
    }
  });

  test("runs a workflow", () => {
    expect(parseArgs(["---workflow", "editor"])).toEqual({ kind: "workflow", name: "editor", bunArgs: [], args: [] });
    expect(parseArgs(["---workflow=editor"])).toEqual({ kind: "workflow", name: "editor", bunArgs: [], args: [] });
    expect(parseArgs(["---run", "tools/fmt"])).toEqual({ kind: "workflow", name: "tools/fmt", bunArgs: [], args: [] });
  });

  test("workflow keeps bun flags before it and args after it", () => {
    expect(parseArgs(["--smol", "--watch", "---workflow", "editor", "a", "--b", "---list"])).toEqual({
      kind: "workflow",
      name: "editor",
      bunArgs: ["--smol", "--watch"],
      args: ["a", "--b", "---list"],
    });
  });

  test("skips the value of bun flags that take one", () => {
    expect(parseArgs(["--env-file", ".env", "--preload", "@scope/pkg", "---workflow", "editor", "x"])).toEqual({
      kind: "workflow",
      name: "editor",
      bunArgs: ["--env-file", ".env", "--preload", "@scope/pkg"],
      args: ["x"],
    });
    expect(parseArgs(["--env-file=.env", "---workflow", "editor"])).toMatchObject({ kind: "workflow", bunArgs: ["--env-file=.env"] });
  });

  test("workflow without a name is an error", () => {
    expect(parseArgs(["---workflow"]).kind).toBe("error");
    expect(parseArgs(["---workflow="]).kind).toBe("error");
  });

  test("commands and aliases", () => {
    expect(parseArgs(["---list"])).toEqual({ kind: "command", name: "list", args: [] });
    expect(parseArgs(["---ls"])).toEqual({ kind: "command", name: "list", args: [] });
    expect(parseArgs(["---goto", "editor"])).toEqual({ kind: "command", name: "goto", args: ["editor"] });
    expect(parseArgs(["---goto=editor"])).toEqual({ kind: "command", name: "goto", args: ["editor"] });
    expect(parseArgs(["---cd"])).toEqual({ kind: "command", name: "goto", args: [] });
    expect(parseArgs(["---help"])).toEqual({ kind: "command", name: "help", args: [] });
  });

  test("unknown --- flags are an error instead of reaching bun", () => {
    expect(parseArgs(["---nope"]).kind).toBe("error");
    expect(parseArgs(["---"]).kind).toBe("error");
  });

  test("commands other than ---workflow must come first", () => {
    expect(parseArgs(["--smol", "---list"]).kind).toBe("error");
  });
});
