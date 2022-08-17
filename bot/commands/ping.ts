import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"

const Command = {
    enabled: true,
    builder: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Pong!'),
    handler: async (interaction: ChatInputCommandInteraction) => {
        interaction.reply('Pong!')
    }
}

export default Command;