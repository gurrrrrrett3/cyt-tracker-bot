import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  ModalBuilder,
  ModalSubmitInteraction,
  SlashCommandSubcommandBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { bot } from "../../../..";
import TrankManager from "../trankManager";
import Util from "../../../utils/utils";
import SlashCommandBuilder from "../../../loaders/objects/customSlashCommandBuilder";

const Command = new SlashCommandBuilder()
  .setName("trank")
  .setDescription("Get info about Teleport Rankings")
  .addSubcommand((o) =>
    o
      .setName("get")
      .setDescription("Get info about a specific Teleport Ranking")
      .addStringOption((o) => o.setName("trank").setDescription("Name of the rank").setRequired(true))
  )
  .setFunction(async (interaction) => {
    const trank = interaction.options.getString("trank", true);
    const t = await TrankManager.getTrankData(trank);
    if (!t) {
      await interaction.reply({ content: "Trank not found", ephemeral: true });
      return;
    }

    // remove duplicate teleports by player name
    const playerIds: string[] = [];
    t.teleports.forEach((tele) => {
      playerIds.includes(tele.player.id) ? null : playerIds.push(tele.player.id);
    });

    const usesThisWeek = t.teleports.filter((tele) => Date.now() - tele.time.getTime() < 604800000).length;

    const embed = new EmbedBuilder()
      .setTitle(t.data.name)
      .setDescription(
        `**Location:** ${t.data.world}: ${t.data.x}, ${t.data.z}\n${t.data.description}\n\n**Uses:** ${t.teleports.length}\n**Unique Uses: **${playerIds.length}\n**Uses This Week:** ${usesThisWeek}`
      );

    await interaction.reply({ embeds: [embed] });
  })
  .addSubcommand((o) =>
    o
      .setName("edit")
      .setDescription("Edit a Teleport Ranking")

      .addStringOption((o) => o.setName("trank").setDescription("Name of the rank").setRequired(true))
  )
  .setFunction(async (interaction) => {
    const trank = interaction.options.getString("trank", true);

    const id = Util.randomKey(10);

    const t = await TrankManager.getTrankData(trank);

    if (!t) {
      await interaction.reply({ content: "Trank not found", ephemeral: true });
      return;
    }

    const modal = new ModalBuilder()
      .setTitle("Edit Trank")
      .setCustomId(id)
      .setComponents([
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId("name")
            .setLabel("Name")
            .setPlaceholder("Name")
            .setStyle(TextInputStyle.Short)
            .setMinLength(2)
            .setMaxLength(20)
            .setValue(t.data.name)
        ),
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId("description")
            .setLabel("Desription")
            .setPlaceholder("Description")
            .setStyle(TextInputStyle.Paragraph)
            .setMaxLength(1000)
            .setValue(t.data.description ?? undefined)
        ),
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId("tags")
            .setPlaceholder("pw,shop,redstone")
            .setLabel("Tags")
            .setStyle(TextInputStyle.Short)
            .setMaxLength(100)
            .setValue(t.data.tags.split(",").join(", "))
        ),
      ]);

    interaction.showModal(modal);

    bot.modalManager.registerModal(id, async (interaction: ModalSubmitInteraction) => {
      const name = interaction.fields.getTextInputValue("name");
      const description = interaction.fields.getTextInputValue("description");
      const tags = interaction.fields.getTextInputValue("tags");

      await TrankManager.updateTrank(trank, interaction.user.username, {
        name,
        description,
        tags,
      });

      await interaction.reply({ content: "Updated trank", ephemeral: true });
    });
  });
export default Command;
