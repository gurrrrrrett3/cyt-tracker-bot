import { Client } from "discord.js";
import Bot from "../../bot";
import { BaseModuleType, CustomCommandBuilder } from "../loaderTypes";
import CommandBuilder from "../objects/customSlashCommandBuilder";

export default class BaseModule implements BaseModuleType {
    private client?: Client
    private commands: Map<string, CustomCommandBuilder> = new Map();
    constructor(bot: Bot) {
        this.client = bot.client;
        this.client.on("ready", () => {
            console.info(`Loaded module ${this.constructor.name}`);
        })

        this.init(bot);
    }

    async init(bot: Bot) {}
}
