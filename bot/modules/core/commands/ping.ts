import { Embed, EmbedBuilder } from "discord.js";
import SlashCommandBuilder from "../../../loaders/objects/customSlashCommandBuilder";

const Command = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Pong!")
  .setFunction(async (interaction) => {
    const msg = await interaction.reply({
      content: "Pong!",
      fetchReply: true,
    });

    await interaction.editReply({
        content: `Pong!`,
        embeds: [
          new EmbedBuilder()
            .setTitle("Pong!")
            .setDescription(
              [
                `**Latency:** ${msg.createdTimestamp - interaction.createdTimestamp}ms`,
                `**API Latency:** ${Math.round(interaction.client.ws.ping)}ms`,
                `**Uptime:** ${interaction.client.uptime}ms`,
              ].join("\n"))
            .setColor("Random")
            .setTimestamp()
        ]
            
    })
  });

export default Command;