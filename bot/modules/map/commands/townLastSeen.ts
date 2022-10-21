import { Colors, EmbedBuilder } from "discord.js";
import { Data } from "ws";
import MapModule from "..";
import SlashCommandBuilder from "../../../loaders/objects/customSlashCommandBuilder";
import Util from "../../../utils/utils";
import MapDatabaseManager from "../mapDatabaseManager";

const Command = new SlashCommandBuilder()
  .setName("townlastseen")
  .setDescription("Get the last time a member of a town was last seen online.")
  .addStringOption((option) =>
    option
      .setName("town")
      .setDescription("The town to get the last seen time for.")
      .setRequired(true)
      .setAutocomplete(async (interaction, input) => {
        const towns = await MapModule.getMapModule().mm.getTownList();
        return towns
          .filter((town) => town.name.toLowerCase().includes(input.toLowerCase()))
          .map((town) => {
            return {
              name: town.name,
              value: town.name,
            };
          });
      })
  )
  .setFunction(async (interaction) => {
    const town = interaction.options.getString("town", true);
    await interaction.deferReply();

    const townData = await MapDatabaseManager.getTownByName(town);
    console.log(townData);
    const residents = townData?.residents;

    if (!residents || residents.length == 0) {
      await interaction.editReply({
        content: `No residents found for town ${town}`,
      });
      return;
    }

    const data: {username: string, lastSeen: Date}[] = [];

    for (const username of residents) {
        const player = await MapDatabaseManager.getPlayer(username);
        if (!player) continue;

        const lastSeen = player.Session.at(-1)?.endedAt;
        if (!lastSeen) continue;

        data.push({
            username,
            lastSeen
        });

    }

    const desc = data.sort((a, b) => b.lastSeen.getTime() - a.lastSeen.getTime()).map((d) => `**${d.username}**: ${Util.formatDiscordTime(d.lastSeen, "longDateTime")} (${Util.formatDiscordTime(d.lastSeen, "relative")})`).join("\n");

    const embed = new EmbedBuilder()
        .setTitle(`Last Seen for ${town}`)
        .setDescription(desc)
        .setColor(Colors.Blue)
        .setTimestamp();

    await interaction.editReply({
        embeds: [embed]
    });
  });

export default Command;
