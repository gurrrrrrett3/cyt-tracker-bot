import { Client, EmbedBuilder } from "discord.js";
import ModuleLoader from "./loaders/moduleLoader";
import CommandLoader from "./loaders/commandLoader";
import ButtonManager from "./loaders/managers/buttonManager";
import SelectMenuManager from "./loaders/managers/selectMenuManager";
import ModalManager from "./loaders/managers/modalManager";
import Logger from "./utils/logger";

export default class Bot {

    commandLoader: CommandLoader
    moduleLoader: ModuleLoader

    buttonManager: ButtonManager
    selectMenuManager: SelectMenuManager
    modalManager: ModalManager
  
  constructor(public client: Client) {
    this.client
      .on("ready", () => {
        Logger.info("Bot", `Logged in as ${this.client.user?.tag}`);

      })
      
    this.commandLoader = new CommandLoader(this.client);
    this.moduleLoader = new ModuleLoader(this);
    
    this.buttonManager = new ButtonManager(this.client);
    this.selectMenuManager = new SelectMenuManager(this.client);
    this.modalManager = new ModalManager(this.client);

    this.client.on("messageCreate", async (message) => {
      const sticker = message.stickers.first();
      if (!sticker) return;

      if (message.content.toLowerCase() == "png") {
        const stickerUrl = sticker.url;
        const stickerName = sticker.name;
        const stickerId = sticker.id;
  
        const stickerEmbed = new EmbedBuilder()
          .setTitle(`Info for ${stickerName}`)
          .addFields([
            {
              name: "Sticker Name",
              value: stickerName,
              inline: true,
            },
            {
              name: "Sticker ID",
              value: stickerId,
              inline: true,
            },
            {
              name: "Sticker URL",
              value: stickerUrl,
              inline: true,
            },
          ])
          .setImage(stickerUrl)

        message.reply({ embeds: [stickerEmbed] });
      }

     
    })
  }
}
