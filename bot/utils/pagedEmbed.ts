import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    ContextMenuCommandInteraction,
    EmbedBuilder,
    ModalSubmitInteraction,
    SelectMenuInteraction,
  } from "discord.js";
import { bot } from "../..";
import Util from "./utils";
  
  export default class PagedEmbed {
    public readonly globalKey = Util.randomKey(10);
    public currentPage = 1;
    constructor(
      interaction:
        | ChatInputCommandInteraction
        | ButtonInteraction
        | SelectMenuInteraction
        | ModalSubmitInteraction
        | ContextMenuCommandInteraction,
      public generateEmbed: (page: number) => Promise<EmbedBuilder>,
      public options?: {
        pageCount?: number;
        currentPage?: number;
        refreshButton?: boolean;
        firstLastButtons?: boolean;
        footer?: boolean;
      }
    ) {
      if (options?.currentPage) {
        this.currentPage = options.currentPage;
      }
  
      this.registerButtons();
      this.send(interaction);
    }
  
    public registerButtons() {
      if (this.options?.refreshButton) {
        bot.buttonManager.registerButton(`${this.globalKey}-refresh`, async (btn: ButtonInteraction) => {
          await this.update(btn);
        });
      }
  
      if (this.options?.firstLastButtons) {
        bot.buttonManager.registerButton(`${this.globalKey}-first`, async (btn: ButtonInteraction) => {
          this.currentPage = 1;
          await this.update(btn);
        });
  
        bot.buttonManager.registerButton(`${this.globalKey}-last`, async (btn: ButtonInteraction) => {
          this.currentPage = this.options?.pageCount || 1;
          await this.update(btn);
        });
      }
  
      bot.buttonManager.registerButton(`${this.globalKey}-prev`, async (btn: ButtonInteraction) => {
        this.currentPage--;
        await this.update(btn);
      });
  
      bot.buttonManager.registerButton(`${this.globalKey}-next`, async (btn: ButtonInteraction) => {
        this.currentPage++;
        await this.update(btn);
      });
    }
  
    public async generateButtons() {
      const row = new ActionRowBuilder<ButtonBuilder>();
      const prev = new ButtonBuilder().setCustomId(`${this.globalKey}-prev`).setEmoji("⬅️").setStyle(ButtonStyle.Primary).setDisabled(this.currentPage === 1);
      const next = new ButtonBuilder().setCustomId(`${this.globalKey}-next`).setEmoji("➡️").setStyle(ButtonStyle.Primary).setDisabled(this.currentPage === this.options?.pageCount || false);
      const first = new ButtonBuilder().setCustomId(`${this.globalKey}-first`).setEmoji("⏮️").setStyle(ButtonStyle.Secondary).setDisabled(this.currentPage === 1);
      const last = new ButtonBuilder().setCustomId(`${this.globalKey}-last`).setEmoji("⏭️").setStyle(ButtonStyle.Secondary).setDisabled(this.currentPage === this.options?.pageCount || false);
      const refresh = new ButtonBuilder().setCustomId(`${this.globalKey}-refresh`).setEmoji("🔄").setStyle(ButtonStyle.Secondary);
  
      if (this.options?.firstLastButtons) {
        row.addComponents(first, prev, next, last);
      } else {
          row.addComponents(prev, next);
      }
  
      if (this.options?.refreshButton) {
        row.addComponents(refresh);
      }
  
      return row;
    }
  
    public async update(btn: ButtonInteraction) {
      await btn.update({
        embeds: [await this.getEmbed()],
        components: [await this.generateButtons()],
      });
    }
  
    public async send(
      interaction:
        | ChatInputCommandInteraction
        | ButtonInteraction
        | SelectMenuInteraction
        | ModalSubmitInteraction
        | ContextMenuCommandInteraction
    ) {
      await interaction.reply({
        embeds: [await this.getEmbed()],
        components: [await this.generateButtons()],
      });
    }
  
    public async getEmbed() {
      const embed = await this.generateEmbed(this.currentPage);
      if (this.options?.footer) {
        embed.setFooter({
          text: `Page ${this.currentPage}/${this.options?.pageCount || 1}`,
        });
      }
  
      return embed;
    }
  }
  