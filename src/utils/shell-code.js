export function useCmd() {
  function exec(commands, opts = {}) {
    const options = {
      windowsHide: false,
      windowsVerbatimArguments: true,
      detached: false,
      stdio: ["inherit", "inherit", "inherit"]
    };

    return Bun.spawn({ cmd: ["cmd", "/C", ...commands], ...mergeObjects(options, opts) });
  }

  return {
    exec
  }
}

export function usePowershell() {
  function exec(commands, opts = {}) {
    const options = {
      windowsHide: false,
      windowsVerbatimArguments: true,
      detached: false,
      stdio: ["inherit", "inherit", "inherit"]
    };

    return Bun.spawn({ cmd: ["powershell.exe", ...commands], ...mergeObjects(options, opts) });
  }

  return {
    exec
  }
}

function mergeObjects(options, newOptions) {
  if (!Object.keys(newOptions).length) {
    return { ...options };
  }
  else {
    return { ...options, ...newOptions };
  }
}