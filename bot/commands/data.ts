import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"

const Command = {
    enabled: false, 
    builder: new SlashCommandBuilder()
        .setName('data')
        .setDescription('An overall counter for the amount of data stored in the bot\'s database'),
    handler: async (interaction: ChatInputCommandInteraction) => {
        

    }
}

export default Command;