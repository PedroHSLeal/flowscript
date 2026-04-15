import { usePowershell } from "./shell-code";

export function symbolinkLinkOps() {
  const { exec: execPwsh } = usePowershell();

  async function addLink(linkPath, originalPath) {
    const p = execPwsh([`Start-Process \"cmd.exe\" -ArgumentList \"/C mklink /j ${linkPath} ${originalPath}\" -Verb RunAs`], { windowsVerbatimArguments: false });
    await p.exited;
  }

  async function removeLink(linkPath) {
    const p = execPwsh([`Start-Process \"cmd.exe\" -ArgumentList \"/C rd ${linkPath}\"`], { windowsVerbatimArguments: false });
    await p.exited;
  }

  return {
    addLink,
    removeLink
  }
}