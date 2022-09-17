import Bot from "../../bot";
import BaseModule from "./baseModule";
import { CustomCommandBuilder } from "../loaderTypes";
import fs from "fs"
import path from "path"

export default class Module extends BaseModule {
     name: string = ""
     description: string = ""

    constructor(bot: Bot) {
        super(bot);
    }
    
    async init(bot: Bot): Promise<void> {}
    
    async onUnload() {}

    public async loadCommands() {
        if (!fs.existsSync(path.resolve(`./dist/bot/modules/${this.name}/commands`))) {
            console.log(`No commands found for module ${this.name}, skipping...`)
            return []
        }
        const commandFolder = fs.readdirSync(path.resolve(`./dist/bot/modules/${this.name}/commands`));
        let commands: CustomCommandBuilder[] = [];
        for (const commandFile of commandFolder) {
            const command = require(path.resolve(`./dist/bot/modules/${this.name}/commands/${commandFile}`)).default as CustomCommandBuilder;
            command.setModule(this.name);            
            commands.push(command);
        }

        return commands;
    }
}