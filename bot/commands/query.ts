import {
  ChatInputCommandInteraction,
  Embed,
  EmbedBuilder,
  SlashCommandBuilder,
  SlashCommandStringOption,
} from "discord.js";
import PagedEmbed from "../utils/pagedEmbed";
import Query from "../utils/query";

const Command = {
  enabled: true,
  builder: new SlashCommandBuilder()
    .setName("query")
    .setDescription("Use an advanced query to grab data")
    .addStringOption(
      new SlashCommandStringOption()
        .setName("query")
        .setDescription("The query to send to the the databse, in cytq format")
        .setAutocomplete(true)
        .setRequired(true)
    ),
  handler: async (interaction: ChatInputCommandInteraction) => {
    const query = interaction.options.getString("query", true);

    const res = await Query.query(query);

    new PagedEmbed(
      interaction,
      async (page: number) => {
        const embed = new EmbedBuilder();
        if (Array.isArray(res)) {
          embed.setTitle(`Page ${page + 1} of ${res.length}`);
          embed.setDescription(`\`\`\`json\n${JSON.stringify(res.at(page), null, 2)}\`\`\``);
        } else {
          embed.setTitle(res);
        }
        return embed;
      },
      {
        currentPage: 0,
        pageCount: Array.isArray(res) ? res.length : 1,
        firstLastButtons: true,
        extraFooterText: query,
        footer: true
      }
    );
  },
};

export default Command;
