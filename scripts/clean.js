const fs = require("fs")

fs.unlinkSync("./bot/modules/example/")
fs.unlinkSync("./bot/modules/README.md")
fs.unlinkSync("./bot/loaders/README.md")

console.log("Cleaned up!")