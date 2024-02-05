import { Colors, EmbedBuilder } from "discord.js";
import { Data } from "ws";
import MapModule from "..";
import SlashCommandBuilder from "../../../loaders/objects/customSlashCommandBuilder";
import Logger from "../../../utils/logger";
import Util from "../../../utils/utils";
import MapDatabaseManager from "../mapDatabaseManager";
import PagedEmbed from "../../../utils/pagedEmbed";

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
    Logger.log("TownLastSeen", townData);
    const residents = townData?.residents;

    if (!residents || residents.length == 0) {
      await interaction.editReply({
        content: `No residents found for town ${town}`,
      });
      return;
    }

    const data: { username: string, lastSeen: Date }[] = []

    await Promise.all(residents.map(async (username) => {

      const player = await MapDatabaseManager.getPlayer(username);
      if (!player) return;

      const lastSeen = player.Session.at(-1)?.endedAt;
      if (!lastSeen) return;

      data.push({
        username,
        lastSeen
      });
    }));

    const desc = data.sort((a, b) => b.lastSeen.getTime() - a.lastSeen.getTime()).map((d) => `**${d.username}**: ${Util.formatDiscordTime(d.lastSeen, "longDateTime")} (${Util.formatDiscordTime(d.lastSeen, "relative")})`).join("\n");

    const paged = Util.pagnateString(desc, '\n')


    new PagedEmbed(interaction, async (page) => {
      return new EmbedBuilder()
        .setTitle(`Last Seen for ${town}`)
        .setDescription(paged[page])
        .setColor(Colors.Yellow)
    }, {
      footer: true,
      extraFooterText: `${data.length} residents found.`,
      firstLastButtons: true,
      pageCount: paged.length,
      edit: true
    })
  });

export default Command;
