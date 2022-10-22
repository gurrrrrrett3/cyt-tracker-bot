import {
  EmbedBuilder,
} from "discord.js";
import { db } from "../../../..";
import Util from "../../../utils/utils";
import SlashCommandBuilder from "../../../loaders/objects/customSlashCommandBuilder";
import MapDatabaseManager from "../mapDatabaseManager";


const Command =  new SlashCommandBuilder()
    .setName("player")
    .setDescription("Get data for a player")
    .addStringOption(
      o => o
        .setName("player")
        .setDescription("The player to get data for")
        .setRequired(true)
        .setAutocomplete(async (interaction, input) => {
          const players = await MapDatabaseManager.searchPlayer(input, {
            limit: 25,
          })

          return players.map(player => ({
            name: player,
            value: player,
          }))
        })
    )
    .setFunction(async (interaction) => {
    
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
      interaction.reply({
        content: "No player found",
        ephemeral: true,
      });
      return
    }

    const lastSession = playerData.Session[0];

    const embed = new EmbedBuilder()
      .setTitle(playerData.username)
      .setDescription(
        [
          `**Resident of:** ${playerData.residentOf?.name ?? "None"}`,
          `**Assistant of:** ${playerData.assistantOf?.name ?? "None"}`,
          `**Owner of:** ${playerData.ownerOf?.name ?? "None"}`,
          ``,
          `**First seen:** ${Util.formatDiscordTime(
            playerData.createdAt,
            "longDateTime"
          )} (${Util.formatDiscordTime(playerData.createdAt, "relative")})`,
          lastSession ? `**Last seen:** ${Util.formatDiscordTime(
            playerData.updatedAt,
            "longDateTime"
          )} (${Util.formatDiscordTime(lastSession?.startedAt, "relative")})` : "No sessions foui nd",
          ``,
          `**Total sessions:** ${playerData.Session.length ?? 0}`,
          `**ID:** ${playerData.id}`,
        ].join("\n")
      );

    interaction.reply({
      embeds: [embed],
    });
  });

export default Command;
