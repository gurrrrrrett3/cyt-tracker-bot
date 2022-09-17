const fs = require("fs")

fs.rmSync("./bot/modules/example/", {
    recursive: true,
    force: true
})
fs.rmSync("./scripts", {
    recursive: true,
    force: true
})
fs.rmSync("./bot/modules/README.md")
fs.rmSync("./bot/loaders/README.md")

console.log("Cleaned up!")