export function prettyPrint(content) {
  const max = (arr) => arr.reduce((prev, curr) => Math.max(prev, curr), -Infinity);

  let isMultiline = content.includes("\n");
  let maxLine = isMultiline ? max(content.split("\n").map(l => l.length)) : content.length;
  return `###${"#".repeat(maxLine + 2)}###\n### ${content} ###\n###${"#".repeat(maxLine + 2)}###`
}