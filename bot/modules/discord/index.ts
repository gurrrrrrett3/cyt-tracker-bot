import { Client } from "discord.js";
import { bot, db } from "../../..";
import Bot from "../../bot";
import Module from "../../loaders/base/module";
import MessageManager from "./messageManager";

export default class DiscordModule extends Module {
  name = "discord";
  description = "No description provided";

  messageManager?: MessageManager

  static getDiscordModule(): DiscordModule {
    return bot.moduleLoader.getModule("discord") as DiscordModule;
  }

  public override async onLoad(): Promise<boolean> {
    bot.client.on("guildCreate", async (guild) => {
      await db.discordSettings.create({
        data: {
          guildId: guild.id,
        },
      });
    });

    bot.client.on("ready", async () => {
      this.messageManager = new MessageManager();
    });

    return true;
  }
}
