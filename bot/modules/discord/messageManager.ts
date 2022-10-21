import { Client } from "discord.js";
import { bot } from "../../..";
import GuildMessageManager from "./guildMessageManager";

export default class MessageManager {
    private guilds: Map<string, GuildMessageManager> = new Map();
    constructor() {
        this.loadGuilds();
    }

    private async loadGuilds() {
        const guilds = bot.client.guilds.cache;
        guilds.forEach((guild) => {
            this.getGuildMessageManager(guild.id);
        });
    }

    public getGuildMessageManager(guildId: string): GuildMessageManager {
        if (!this.guilds.has(guildId)) {
            this.guilds.set(guildId, new GuildMessageManager(bot.client, guildId));
        }

        return this.guilds.get(guildId) as GuildMessageManager;
    }

    public async handleUpdate(data: UpdateFrame) {
        this.guilds.forEach((guild) => {
            guild.handleUpdate(data);
        });
    }
    
}