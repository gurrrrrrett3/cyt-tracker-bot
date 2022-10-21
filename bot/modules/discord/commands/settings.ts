import { ChatInputCommandInteraction, PermissionFlagsBits } from "discord.js";
import { db } from "../../../..";
import CommandBuilder from "../../../loaders/objects/customSlashCommandBuilder";

const Command = new CommandBuilder()
  .setName("settings")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .setDescription("Change guild-specific settings")
  .addSubcommandGroup((group) =>
    group
      .setName("nation")
      .setDescription("Change nation settings")
      .addSubcommand((subcommand) =>
        subcommand
          .setName("name")
          .setDescription("Change the name of the nation to monitor")
          .addStringOption((option) =>
            option.setName("name").setDescription("The name of the nation to monitor").setRequired(true)
          )
          .setFunction(async (interaction: ChatInputCommandInteraction) => {
            const name = interaction.options.getString("name", true);

            await db.discordSettings.update({
              where: {
                guildId: interaction.guildId as string,
              },
              data: {
                nationName: name,
              },
            });
            await interaction.reply({
              content: "Settings updated",
              ephemeral: true,
            });
          })
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("statuschannel")
          .setDescription("Change the channel to show status in")
          .addChannelOption((option) =>
            option.setName("channel").setDescription("The channel to show status in").setRequired(true)
          )
          .setFunction(async (interaction: ChatInputCommandInteraction) => {
            const channel = interaction.options.getChannel("channel", true);

            await db.discordSettings.update({
              where: {
                guildId: interaction.guildId as string,
              },
              data: {
                nationStatusChannelId: channel.id,
              },
            });
            await interaction.reply({
              content: "Settings updated",
              ephemeral: true,
            });
          })
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("updateschannel")
          .setDescription("Change the channel to show updates in")
          .addChannelOption((option) =>
            option.setName("channel").setDescription("The channel to show updates in").setRequired(true)
          )
          .setFunction(async (interaction: ChatInputCommandInteraction) => {
            const channel = interaction.options.getChannel("channel", true);

            await db.discordSettings.update({
              where: {
                guildId: interaction.guildId as string,
              },
              data: {
                nationUpdatesChannelId: channel.id,
              },
            });

            await interaction.reply({
              content: "Settings updated",
              ephemeral: true,
            });
          })
      )
  );

export default Command;
