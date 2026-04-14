import { $ } from "bun";
import { args, id, openInEditor, usePowershell } from "../../utils";

/* const { values, tokens } = args({
  shortcut: { type: "string", short: "s" },
  dockerfile: { type: "boolean", short: "d" },
  edit: { type: "boolean", short: "e" },
  cwd: { type: "string" }
}); */

// const {values: otherValues } = args({ "bare-metal": { type: "string" } });
// console.log(otherValues);

// await openInEditor(values.cwd);
// await $`nvim .`.cwd(values.cwd);

// const withImports = await import("./module/with-imports.mjs");
// const { default: seila2, anotherExport } = await import("./module/without-imports.mjs");

// console.log(Object.keys(withImports));
// console.log(seila2);
// console.log(anotherExport);

// const { addLink, removeLink, checkIfLinkExists } = symbolinkLinkOps();

// await addLink("C:\\Users\\henri\\fun\\shenanigans\\alguma-coisa", "C:\\Users\\henri\\fun\\apps\\stackedit\\stack-and-ditto");
// await addLink("C:\\Users\\henri\\fun\\shenanigans\\alguma-coisa--2", "C:\\Users\\henri\\fun\\apps\\stackedit\\stack-and-ditto");
// await removeLink("C:\\Users\\henri\\fun\\shenanigans\\alguma-coisa--2");

// console.log(await checkIfLinkExists("C:\\Users\\henri\\fun\\shenanigans\\alguma-coisa", "C:\\Users\\henri\\fun\\shenanigans"));

// for (let i = 0; i < 10; i++) {
//   console.log(id());
// }

// let { seila } = args({ seila: { type: "string", short: "m" } }, {}, Bun.argv);
// console.log(seila);

// export function symbolinkLinkOps() {
//   const { $ } = Bun;
//   const { exec } = usePowershell();

//   async function addLink(linkPath, originalPath) {
//     const p = exec([`Start-Process \"cmd.exe\" -ArgumentList \"/C mklink /j ${linkPath} ${originalPath}\" -Verb RunAs`], { windowsVerbatimArguments: false });
//     await p.exited;
//   }

//   async function removeLink(linkPath) {
//     const p = exec([`Start-Process \"cmd.exe\" -ArgumentList \"/C rd ${linkPath}\"`], { windowsVerbatimArguments: false });
//     await p.exited;
//   }

//   async function checkIfLinkExists(linkPath, basePath) {
//     const p = await $`ls -l`.cwd(basePath).text();
//     console.log(p);
//     return p.includes(linkPath);
//   }

//   return {
//     addLink,
//     removeLink,
//     checkIfLinkExists
//   }
// }

console.log(btoa("C:\\Users\\henri\\fun\\shenanigans\\alguma-coisa"))
console.log(atob("QzpcVXNlcnNcaGVucmlcZnVuXHNoZW5hbmlnYW5zXGFsZ3VtYS1jb2lzYQ=="))