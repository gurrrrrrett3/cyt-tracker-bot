import { ActionRowBuilder, ChatInputCommandInteraction, EmbedBuilder, ModalBuilder, ModalSubmitInteraction, SlashCommandBuilder, SlashCommandStringOption, SlashCommandSubcommandBuilder, TextInputBuilder } from "discord.js";
import { bot } from "../..";
import TrankManager from "../modules/map/trankManager";
import Util from "../utils/utils";

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
    )
    .addSubcommand(new SlashCommandSubcommandBuilder()
        .setName("edit")
        .setDescription("Edit a Teleport Ranking")

    )
    ,
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
    } else if (subcommand === "edit") {
        const id = Util.randomKey(10)

        const t = await TrankManager.getTrankData(trank);

        if (!t) {
            await interaction.reply({ content: "Trank not found", ephemeral: true });
            return;
        }

        const modal = new ModalBuilder()
            .setTitle("Edit Trank")
            .setCustomId(id)
            .setComponents([
                new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder().setCustomId("name").setPlaceholder("Name").setMinLength(1).setMaxLength(20).setValue(t?.data.name)),
                new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder().setCustomId("description").setPlaceholder("Description").setMinLength(1).setMaxLength(1000).setValue(t.data.description ?? undefined)),
                new ActionRowBuilder<TextInputBuilder>().addComponents(new TextInputBuilder().setCustomId("tags").setPlaceholder("pw,shop,redstone").setMinLength(1).setMaxLength(20).setValue(t.data.tags.split(",").join(", ")))
            ])

        bot.modalManager.registerModal(id, async (interaction: ModalSubmitInteraction) => {
            const name = interaction.fields.getTextInputValue("name");
            const description = interaction.fields.getTextInputValue("description");
            const tags = interaction.fields.getTextInputValue("tags");

            await TrankManager.updateTrank(trank, {
                name,
                description,
                tags
            });

            await interaction.reply({ content: "Updated trank", ephemeral: true });
        })
    }
  },
};

export default Command;
