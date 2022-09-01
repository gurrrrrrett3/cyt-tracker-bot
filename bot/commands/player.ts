import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
  SlashCommandStringOption,
} from "discord.js";
import { db } from "../..";
import Util from "../utils/utils";

const Command = {
  enabled: true,
  builder: new SlashCommandBuilder()
    .setName("player")
    .setDescription("Get data for a player")
    .addStringOption(
      new SlashCommandStringOption()
        .setAutocomplete(true)
        .setName("player")
        .setDescription("The player to get data for")
        .setRequired(true)
    ),
  handler: async (interaction: ChatInputCommandInteraction) => {
    const player = interaction.options.getString("player", true);

    const playerData = await db.player.findFirst({
      where: {
        username: {
          contains: player,
        },
      },
      include: {
        assistantOf: true,
        ownerOf: true,
        residentOf: true,
        Session: {
          orderBy: {
            startedAt: "desc",
          },
        },
      },
    });

    if (!playerData) {
      return interaction.reply({
        content: "No player found",
        ephemeral: true,
      });
    }

    const lastAsession = playerData.Session[0];

    const embed = new EmbedBuilder()
      .setTitle(playerData.username)
      .setDescription(
        [
          `**Id:** ${playerData.id}`,
          `**Resident of:** ${playerData.residentOf?.name ?? "None"}`,
          `*Assistant of:** ${playerData.assistantOf?.name ?? "None"}`,
          `**Owner of:** ${playerData.ownerOf?.name ?? "None"}`,
          ``,
          `**First seen:** ${Util.formatDiscordTime(
            playerData.createdAt,
            "longDateTime"
          )} (${Util.formatDiscordTime(playerData.createdAt, "relative")})`,
          `**Last seen:** ${Util.formatDiscordTime(
            playerData.updatedAt,
            "longDateTime"
          )} (${Util.formatDiscordTime(lastAsession.startedAt, "relative")})`,
          ``,
          `**Total sessions:** ${playerData.Session.length}`,
          `**ID:** ${playerData.id}`,
        ].join("\n")
      );

    interaction.reply({
      embeds: [embed],
    });
  },
};

export default Command;
