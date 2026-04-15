export function manageContainers(path) {
  const filePath = `${path}\\running.db.json`;

  async function __exists() {
    if (!(await Bun.file(filePath).exists())) {
      const file = Bun.file(filePath);
      await file.write("{}");
    }
  }

  async function register(db, id, fullPath, folderName) {
    await __exists();

    let key = `${Date.now()}`;

    if (db[fullPath]) {
      db[fullPath].instances.push(key);
    }
    else {
      db[fullPath] = { id, instances: [key] };
    }

    await Bun.file(filePath).write(JSON.stringify(db));
    return key;
  }

  async function read() {
    await __exists();

    return await Bun.file(filePath).json();
  }

  async function exists(db, fullPath) {
    await __exists();

    return Object.keys(db).includes(fullPath);
  }

  async function get(db, fullPath) {
    await __exists();
    return db[fullPath];
  }

  return {
    register,
    read,
    exists,
    get
  }
}