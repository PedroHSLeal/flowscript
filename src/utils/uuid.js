let a = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
let nanoid = (e = 21) => { let t = "", r = crypto.getRandomValues(new Uint8Array(e |= 0)); for (; e--;)t += a[63 & r[e]]; return t };
export function id() {
  return nanoid();
}