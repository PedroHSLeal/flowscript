import { describe, expect, test } from "bun:test";
import { parseArgs } from "./cli";

describe("parseArgs", () => {
  test("no args goes to bun", () => {
    expect(parseArgs([])).toEqual({ kind: "bun", args: [] });
  });

  test("plain bun calls pass through untouched", () => {
    for (const argv of [
      ["run", "dev"],
      ["script.ts", "---workflow", "x"],
      ["add", "@types/node"],
      ["--smol", "run", "script.ts", "---run", "list"],
      ["--eval", "---run", "script.ts"],
      ["--", "---workflow", "list"],
      ["-", "---workflow", "list"],
    ]) {
      expect(parseArgs(argv)).toEqual({ kind: "bun", args: argv });
    }
  });

  test("runs a workflow", () => {
    expect(parseArgs(["---workflow", "list"])).toEqual({ kind: "workflow", name: "list", bunArgs: [], args: [] });
    expect(parseArgs(["---workflow=goto", "editor"])).toEqual({ kind: "workflow", name: "goto", bunArgs: [], args: ["editor"] });
    expect(parseArgs(["---run", "tools/fmt"])).toEqual({ kind: "workflow", name: "tools/fmt", bunArgs: [], args: [] });
  });

  test("workflow keeps bun flags before it and args after it", () => {
    expect(parseArgs(["--smol", "--watch", "---workflow", "editor", "a", "--b", "---run"])).toEqual({
      kind: "workflow",
      name: "editor",
      bunArgs: ["--smol", "--watch"],
      args: ["a", "--b", "---run"],
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

  test("the old flags and unknown --- flags are an error instead of reaching bun", () => {
    for (const flag of ["---list", "---goto", "---help", "---nope", "---"]) {
      expect(parseArgs([flag]).kind).toBe("error");
    }
  });
});
