import { EmbedBuilder } from "discord.js";
import MapDatabaseManager from "../mapDatabaseManager";
import PagedEmbed from "../../../utils/pagedEmbed";
import Time from "../../../utils/time";
import Util from "../../../utils/utils";
import SlashCommandBuilder from "../../../loaders/objects/customSlashCommandBuilder";

const Command = new SlashCommandBuilder()
  .setName("sessions")
  .setDescription("Get a list of sessions for a player")
  .addStringOption((o) =>
    o
      .setName("player")
      .setDescription("The player to get the sessions for")
      .setRequired(true)
      .setAutocomplete(async (interaction, input) => {
        const players = await MapDatabaseManager.searchPlayer(input, {
          limit: 25,
        });

        return players.map((player) => ({
          name: player,
          value: player,
        }));
      })
  )
  .setFunction(async (interaction) => {
    const username = interaction.options.getString("player", true);
    const player = await MapDatabaseManager.getPlayer(username);
    const sessions = player.Session.reverse();
    const sessionsPerPage = 10;

    new PagedEmbed(
      interaction,
      async (page) => {
        const offset = sessionsPerPage * page;
        const pagedSessions = sessions.slice(offset, sessionsPerPage * (page + 1));
        const embed = new EmbedBuilder().setTitle(`${username} | Sessions`).setDescription(
          `${username} has ${sessions.length} Session${sessions.length == 1 ? "" : "s"}\n` +
            pagedSessions
              .map((s, i) => {
                return `${i + offset + 1}: ${Util.formatDiscordTime(s.startedAt, "shortDateTime")} - ${
                  s.isOnline ? "**Currently Online**" : Util.formatDiscordTime(s.endedAt, "shortDateTime")
                } | ${new Time((s.isOnline ? Date.now() : Number(s.endedAt)) - Number(s.startedAt)).toString(
                  true
                )}`;
              })
              .join("\n")
        );

        return embed;
      },
      {
        currentPage: 0,
        firstLastButtons: true,
        footer: true,
        pageCount: Math.ceil(sessions.length / sessionsPerPage) || 1,
        refreshButton: false,
        extraFooterText: `PlayerId: ${player.id}`,
      }
    );
  });

export default Command;
