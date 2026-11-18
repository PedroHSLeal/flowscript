// built-in workflows: shipped inside the flowscript binary and run in-process
// a user workflow with the same name (local or global) takes precedence over them

import goto from "./goto";
import help from "./help";
import list from "./list";

export type BuiltinWorkflow = {
  usage: string;
  description: string;
  // returns the exit code
  run(args: string[]): Promise<number>;
};

export const BUILTIN_WORKFLOWS: Record<string, BuiltinWorkflow> = { list, goto, help };
