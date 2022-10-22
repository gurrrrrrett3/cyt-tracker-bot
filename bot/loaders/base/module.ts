import Bot from "../../bot";
import { BaseModuleType, CustomCommandBuilder } from "../loaderTypes";
import fs from "fs"
import path from "path"
import { Client } from "discord.js";
import Logger from "../../utils/logger";

export default class Module implements BaseModuleType {
     name: string = ""
     description: string = ""

    private client?: Client
    private commands: Map<string, CustomCommandBuilder> = new Map();

    constructor(bot: Bot) {
        this.client = bot.client;
        this.client.on("ready", () => {
            Logger.info(`Module: ${this.name}`, `Loaded module ${this.constructor.name}`);
        })
    }

    /**
     * Override this method to run code when the module is loaded
     */
    async onLoad(): Promise<Boolean> {
        Logger.log(`Module: ${this.name}`, `Loaded module ${this.name}`);
        return true;
    }

    /**
     * Override this method to run code when the module is unloaded
     */
    async onUnload(): Promise<Boolean> {
        Logger.log(`Module: ${this.name}`, `Unloaded module ${this.name}`);
        return true;
    }
         
    public async loadCommands() {
        if (!fs.existsSync(path.resolve(`./dist/bot/modules/${this.name}/commands`))) {
            Logger.warn(`Module: ${this.name}` , `No commands found for module ${this.name}, skipping...`)
            return []
        }
        const commandFolder = fs.readdirSync(path.resolve(`./dist/bot/modules/${this.name}/commands`));
        
        const commands: CustomCommandBuilder[] = [];
        this.commands = new Map();

        for (const commandFile of commandFolder) {
            const command = require(path.resolve(`./dist/bot/modules/${this.name}/commands/${commandFile}`)).default as CustomCommandBuilder;
            command.setModule(this.name);            
            commands.push(command);

            this.commands.set(command.getName(), command);
        }

        return commands;
    }
}