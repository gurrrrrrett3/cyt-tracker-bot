import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder, SlashCommandStringOption, SlashCommandSubcommandBuilder } from "discord.js";
import TrankManager from "../modules/map/trankManager";

const Command = {
  enabled: true,
  builder: new SlashCommandBuilder()
    .setName("trank")
    .setDescription("Get info about Teleport Rankings")
    .addSubcommand(new SlashCommandSubcommandBuilder()
        .setName("get")
        .setDescription("Get info about a specific Teleport Ranking")
        .addStringOption(
          new SlashCommandStringOption().setName("trank").setDescription("Name of the rank").setRequired(true)
        )
    ),
  handler: async (interaction: ChatInputCommandInteraction) => {
    const subcommand = interaction.options.getSubcommand(true);
    const trank = interaction.options.getString("trank", true);

    if (subcommand === "get") {
        const t = await TrankManager.getTrankData(trank);
        if (!t) {
            await interaction.reply({ content: "Trank not found", ephemeral: true });
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle(t.data.name)
            .setDescription(`${t.data.world}: ${t.data.x}, ${t.data.z}\n\n${t.data.description}\n\n**Teleports:** ${t.teleports.length}`)

        await interaction.reply({ embeds: [embed] });
    }   
  },
};

export default Command;
