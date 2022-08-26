import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
  SlashCommandStringOption,
} from "discord.js";
import { bot } from "../..";
import MapDatabaseManager from "../modules/map/mapDatabaseManager";
import PagedEmbed from "../utils/pagedEmbed";
import Time from "../utils/time";
import Util from "../utils/utils";

const Command = {
  enabled: true,
  builder: new SlashCommandBuilder()
    .setName("sessions")
    .setDescription("Get a list of sessions for a player")
    .addStringOption(
      new SlashCommandStringOption()
        .setName("player")
        .setDescription("The player to get the sessions for")
        .setRequired(true)
        .setAutocomplete(true)
    ),
  handler: async (interaction: ChatInputCommandInteraction) => {
    const username = interaction.options.getString("player", true);
    const player = await MapDatabaseManager.getPlayer(username);
    const sessions = player.Session;
    const sessionsPerPage = 10;

    new PagedEmbed(
      interaction,
      async (page) => {
        const offset = sessionsPerPage * (page - 1);
        const pagedSessions = sessions.slice(offset, sessionsPerPage * page - 1);
        const embed = new EmbedBuilder().setTitle(`${username} | Sessions`).setDescription(
          `${username} has ${sessions.length} Session${sessions.length == 1 ? "" : "s"}\n` +
            pagedSessions
              .map((s, i) => {
                return `${i + offset + 1}: ${Util.formatDiscordTime(
                  s.startedAt,
                  "shortDateTime"
                )} - ${s.isOnline ? "**Currently Online**" : Util.formatDiscordTime(s.endedAt, "shortDateTime")} | ${new Time((s.isOnline ? Date.now() : Number(s.endedAt)) - Number(s.startedAt)).toString(true)}`;
              })
              .join("\n")
        )

        return embed;
      },
      {
        currentPage: 1,
        firstLastButtons: true,
        footer: true,
        pageCount: Math.ceil(sessions.length / sessionsPerPage) || 1,
        refreshButton: false,
        extraFooterText: `PlayerId: ${player.id}`,
      }
    );
  },
};

export default Command;
