const args = process.argv.slice(2);
const fs = require("fs");
const path = require("path");

const moduleName = args[0];
const moduleDescription = args.slice(1).join(" ");

const modulePath = path.resolve(`./bot/modules/${moduleName}`);

if (fs.existsSync(modulePath)) {
    console.log("Error: Module already exists | Cancelling");
    process.exit(1);
}


const moduleIndex = fs
  .readFileSync(path.resolve("./scripts/resources/module.index.template"), "utf8")
  .toString()
  .replace(/<name>/g, moduleName)
  .replace(
    /<nameUppercase>/g,
    moduleName
      .split("")
      .map((c, i) => (i === 0 ? c.toUpperCase() : c))
      .join("")
  )
  .replace(/<desc>/g, moduleDescription || "No description provided");

fs.mkdirSync(modulePath);
fs.mkdirSync(`${modulePath}/commands`);
fs.writeFileSync(`${modulePath}/index.ts`, moduleIndex);

console.log(`Created module ${moduleName}`);
