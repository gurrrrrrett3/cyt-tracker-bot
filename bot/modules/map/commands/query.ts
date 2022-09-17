import {
  EmbedBuilder,
} from "discord.js";
import PagedEmbed from "../../../utils/pagedEmbed";
import Query from "../../../utils/query";
import SlashCommandBuilder from "../../../loaders/objects/customSlashCommandBuilder";

const Command = new SlashCommandBuilder()
    .setName("query")
    .setEnabled(false)
    .setDescription("Use an advanced query to grab data")
    .addStringOption(
      o => o
        .setName("query")
        .setDescription("The query to send to the the databse, in cytq format")
        .setRequired(true)
    )
    .setFunction(async (interaction) => {
    const query = interaction.options.getString("query", true);

    const res = await Query.query(query);

    new PagedEmbed(
      interaction,
      async (page: number) => {
        const embed = new EmbedBuilder();
        if (Array.isArray(res)) {
          embed.setTitle(`Page ${page} of ${res.length}`);
          embed.setDescription(`\`\`\`json\n${JSON.stringify(res.at(page), null, 2)}\`\`\``);
        } else {
          embed.setTitle(res);
        }
        return embed;
      },
      {
        currentPage: 1,
        pageCount: Array.isArray(res) ? res.length : 1,
        firstLastButtons: true,
        extraFooterText: query,
        footer: true
      }
    );
  }
    )

export default Command;
