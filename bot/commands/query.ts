import { ChatInputCommandInteraction, Embed, EmbedBuilder, SlashCommandBuilder, SlashCommandStringOption } from "discord.js"
import Query from "../utils/query";

const Command = {
    enabled: true, 
    builder: new SlashCommandBuilder()
        .setName('query')
        .setDescription('Use an advanced query to grab data')
        .addStringOption(new SlashCommandStringOption()
            .setName("query")
            .setDescription("The query to send to the the databse, in cytq format")
            .setAutocomplete(true)
            .setRequired(true)
        )
        ,
    handler: async (interaction: ChatInputCommandInteraction) => {
            const query = interaction.options.getString("query", true)
            
            const res = await Query.query(query)

            interaction.reply({
                embeds: [new EmbedBuilder().setDescription(`\`\`\`json\n${res}\`\`\``)]
            })
    }
}

export default Command;