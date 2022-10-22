import { AttachmentBuilder, Colors, EmbedBuilder } from "discord.js";
import { db } from "../../../..";
import Util from "../../../utils/utils";
import SlashCommandBuilder from "../../../loaders/objects/customSlashCommandBuilder";
import MapDatabaseManager from "../mapDatabaseManager";
import MapCanvas from "../mapCanvas";

const Command = new SlashCommandBuilder()
  .setName("town")
  .setDescription("Get data for a town")
  .addStringOption((o) =>
    o
      .setName("town")
      .setDescription("The town to get data for")
      .setRequired(true)
      .setAutocomplete(async (interaction, input) => {
        const towns = await MapDatabaseManager.searchTowns(input, {
          limit: 25,
        });

        return towns.map((town) => ({
          name: town,
          value: town,
        }));
      })
  )
  .setFunction(async (interaction) => {
    await interaction.deferReply();
    const town = interaction.options.getString("town", true);

    const townData = await db.town.findFirst({
      where: {
        name: {
          contains: town,
        },
      },
      include: {
        owner: true,
        residents: true,
        assistants: true,
        coordinates: true,
      },
    });

    if (!townData) {
      interaction.reply({
        content: "No town found",
        ephemeral: true,
      });
      return;
    }


    const embed = new EmbedBuilder()
      .setTitle(townData.name)
      .setDescription(
        [
            `**Coordinates:** ${townData.world}, ${townData.x}, ${townData.z}`,
            `**Owner:** ${Util.formatPlayerName(townData.owner?.username)}`,
            `**Assistants:** ${townData.assistants.map((p) => Util.formatPlayerName(p.username)).join(", ")}`,
            `**Residents:** ${townData.residents.length}`,
            townData.residents.map((p) => Util.formatPlayerName(p.username)).join(", "),
            "",
            "**__NOTE: Town preview is in BETA, bugs are expected__**"
        ].join("\n")
      )
      .setFooter({
        text: `Town ID: ${townData.id}`,
      })
      .setColor(Colors.Blue)
      
    const attachment = new AttachmentBuilder(await MapCanvas.drawMapThumbnail(townData.world, townData.x, townData.z, 2), {
        name: `${townData.name}.png`
    });

    interaction.editReply({
      embeds: [embed],
        files: [attachment],
    }).then((msg) => {
        const url = msg.attachments.first()?.url
        if (url) {
            embed.setImage(url)
            interaction.editReply({
                embeds: [embed],
                attachments: []
            })
        }
    })
  });

export default Command;
