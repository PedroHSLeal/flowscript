import { args } from "../utils";

const passedArgs = args({ workDir: { type: "string" }});

console.log(passedArgs);