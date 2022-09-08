import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandStringOption } from "discord.js"

const Command = {
    enabled: true, 
    builder: new SlashCommandBuilder()
        .setName('trank')
        .setDescription('Get info about Teleport Rankings')
            .addStringOption(new SlashCommandStringOption()
                .setName("trank")
                .setDescription("Name of the rank")
                .setRequired(true)
            )
        ,
    handler: async (interaction: ChatInputCommandInteraction) => {
        
    }
}

export default Command;