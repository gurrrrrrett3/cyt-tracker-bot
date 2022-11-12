import { EmbedBuilder } from "discord.js";
import CommandBuilder from "../../../loaders/objects/customSlashCommandBuilder";
import Time from "../../../utils/time";
import Util from "../../../utils/utils";
import MapDatabaseManager from "../mapDatabaseManager";

const Command = new CommandBuilder()
  .setName("playtime")
  .setDescription("Get the playtime of a player")
  .addStringOption((o) =>
    o
      .setName("player")
      .setDescription("The player to get the playtime of")
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
  .addStringOption((o) =>
    o.setName("timeframe").setDescription("The timeframe to get the playtime of").setRequired(false)
  )
  .setFunction(async (interaction) => {
    const player = interaction.options.getString("player", true);
    const timeframe = interaction.options.getString("timeframe", false);

    const playerData = await MapDatabaseManager.getPlayer(player);

    if (!playerData) {
      interaction.reply({
        content: "No player found",
        ephemeral: true,
      });
      return;
    }

    const startTime = timeframe ? new Time(timeframe).getTime() : 0;

    let playtime = 0;

    for (const session of playerData.Session) {
      if (session.startedAt.getTime() < startTime) {
        continue;
      }
      playtime += session.endedAt.getTime() - session.startedAt.getTime();
    }

    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(`Playtime for ${playerData.username}`)
          .setDescription(
            `${playerData.username} played for ${new Time(playtime).toString()}${
              timeframe
                ? ` in the last ${new Time(timeframe).toString()} (since ${Util.formatDiscordTime(
                    new Time(timeframe).ago(),
                    "longDateTime"
                  )}).`
                : "."
            }`
          ),
      ],
    });
  });

export default Command;
