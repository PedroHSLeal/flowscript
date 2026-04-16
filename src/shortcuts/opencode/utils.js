export function manageContainers(path) {
  let _db = null;
  const filePath = `${path}\\running-instances.db.txt`;
  const HEADER = "FULL_PATH,CONTAINER_ID\n";

  async function __exists() {
    if (!(await Bun.file(filePath).exists())) {
      const file = Bun.file(filePath);
      await file.write(HEADER);
    }
    else if (!_db) {
      _db = await __getDb();
    }
  }

  async function __getDb() {
    const text = await Bun.file(filePath).text();
    const obj = {};

    if (text.length == 0) return obj;
    else if (text == HEADER) return obj;
    else {
      let lines = text.split("\n").slice(1);

      for (const line of lines) {
        let [fullPath, instanceId] = line.split(",");

        Object.defineProperty(obj, fullPath, { writable: true, enumerable: true, configurable: true, value: instanceId });
      }

      return obj;
    }
  }

  async function __write() {
    let text = HEADER;

    Object.entries(_db).forEach(([fullPath, instanceId]) => text += fullPath + "," + instanceId + "\n");

    await Bun.write(filePath, text);
  }

  async function get(fullPath) {
    await __exists();
    return _db[fullPath];
  }

  async function set(fullPath) {
    await __exists();

    let key = `${Date.now()}`;

    if (!_db[fullPath]) {
      _db[fullPath] = key;
    }

    await __write();
    return key;
  }

  async function exists(fullPath) {
    await __exists();
    return !get(fullPath);
  }

  return {
    get,
    set,
    exists
  }
}