import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  ModalBuilder,
  ModalSubmitInteraction,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { bot } from "../../../..";
import TrankManager from "../trankManager";
import Util from "../../../utils/utils";
import SlashCommandBuilder from "../../../loaders/objects/customSlashCommandBuilder";
import { Teleport, TeleportCoordinates, Trank } from "@prisma/client";

const Command = new SlashCommandBuilder()
  .setName("trank")
  .setDescription("Get info about Teleport Rankings")
  .addSubcommandGroup((o) =>
    o
      .setName("get")
      .setDescription("Get info about a specific Teleport Ranking")
      .addSubcommand((o) =>
        o
          .setName("name")
          .setDescription("Get info about a specific Teleport Ranking by name")
          .addStringOption((o) =>
            o
              .setName("name")
              .setDescription("The name of the Teleport Ranking")
              .setRequired(true)
              .setAutocomplete(async (interaction, input) => {
                const tranks = await TrankManager.searchTranks(input);
                return tranks.map((trank) => ({
                  name: trank.name,
                  value: trank.name,
                }));
              })
          )
          .setFunction(async (interaction) => {
            const trank = interaction.options.getString("name", true);
            const t = await TrankManager.getTrankData(trank);
            if (!t) {
              await interaction.reply({ content: "Trank not found", ephemeral: true });
              return;
            }

            // remove duplicate teleports by player name
            const playerIds: string[] = [];
            t.teleports.forEach((tele) => {
              playerIds.includes(tele.player.id) ? null : playerIds.push(tele.player.id);
            });

            const usesThisWeek = t.teleports.filter(
              (tele) => Date.now() - tele.time.getTime() < 604800000
            ).length;

            const embed = new EmbedBuilder()
              .setTitle(t.data.name)
              .setDescription(
                `**Location:** ${t.data.world}: ${t.data.x}, ${t.data.z}\n${t.data.description}\n\n**Uses:** ${t.teleports.length}\n**Unique Uses: **${playerIds.length}\n**Uses This Week:** ${usesThisWeek}`
              );

            await interaction.reply({ embeds: [embed] });
          })
      )
  )
  .addSubcommandGroup((o) =>
    o
      .setName("edit")
      .setDescription("Edit a Teleport Ranking")

      .addSubcommand((o) =>
        o
          .setName("name")
          .setDescription("Edit a Teleport Ranking by name")
          .addStringOption((o) =>
            o
              .setName("name")
              .setDescription("The name of the Teleport Ranking")
              .setRequired(true)
              .setAutocomplete(async (interaction, input) => {
                const tranks = await TrankManager.searchTranks(input);
                return tranks.map((trank) => ({
                  name: trank.name,
                  value: trank.name,
                }));
              })
          )
          .setFunction(async (interaction) => {
            const trank = interaction.options.getString("name", true);
            openEditor(interaction, {
              name: trank,
            });
          })
      )
      .addSubcommand((o) =>
        o
          .setName("coords")
          .setDescription("Edit a Teleport Ranking by coordinates")
          .addStringOption((o) =>
            o
              .setName("world")
              .setDescription("The world of the Teleport Ranking")
              .setRequired(true)
              .setChoices(
                {
                  name: "Overworld",
                  value: "world",
                },
                {
                  name: "Earth",
                  value: "earth",
                }
              )
          )
          .addIntegerOption((o) =>
            o.setName("x").setDescription("The x coordinate of the Teleport Ranking").setRequired(true)
          )
          .addIntegerOption((o) =>
            o.setName("z").setDescription("The z coordinate of the Teleport Ranking").setRequired(true)
          )
          .setFunction(async (interaction) => {
            const world = interaction.options.getString("world", true);
            const x = interaction.options.getInteger("x", true);
            const z = interaction.options.getInteger("z", true);
            openEditor(interaction, {
              coords: {
                world,
                x,
                z,
              },
            });
          })
      )
  );

export default Command;

async function openEditor(
  interaction: ChatInputCommandInteraction,
  opt: {
    name?: string;
    coords?: {
      world: string;
      x: number;
      z: number;
    };
  }
) {
  if (!opt.name && !opt.coords) {
    await interaction.reply({ content: "Invalid options", ephemeral: true });
    return;
  }

  let t: any;

  if (opt.name) {
    t = await TrankManager.getTrankData(opt.name);
    if (!t) {
      await interaction.reply({ content: "Trank not found", ephemeral: true });
      return;
    }
  } else if (opt.coords) {
    t = await TrankManager.getTrankByCoords(opt.coords.world, opt.coords.x, opt.coords.z);
    if (!t) {
      await interaction.reply({ content: "Trank not found", ephemeral: true });
      return;
    }

    console.log(t);

    const id = Util.randomKey(10);

    const modal = new ModalBuilder()
      .setTitle("Edit Trank")
      .setCustomId(id)
      .setComponents([
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId("name")
            .setLabel("Name")
            .setPlaceholder("Name")
            .setStyle(TextInputStyle.Short)
            .setMinLength(2)
            .setMaxLength(20)
            .setValue(t.name)
        ),
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId("description")
            .setLabel("Desription")
            .setPlaceholder("Description")
            .setStyle(TextInputStyle.Paragraph)
            .setMaxLength(1000)
            .setValue(t.description ?? undefined)
        ),
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder()
            .setCustomId("tags")
            .setPlaceholder("pw,shop,redstone")
            .setLabel("Tags")
            .setStyle(TextInputStyle.Short)
            .setMaxLength(100)
            .setValue(t.tags.split(",").join(", "))
        ),
      ]);

    interaction.showModal(modal);

    bot.modalManager.registerModal(id, async (interaction: ModalSubmitInteraction) => {
      const name = interaction.fields.getTextInputValue("name");
      const description = interaction.fields.getTextInputValue("description");
      const tags = interaction.fields.getTextInputValue("tags");

      await TrankManager.updateTrank(t.name, interaction.user.username, {
        name,
        description,
        tags,
      });

      await interaction.reply({ content: "Updated trank", ephemeral: true });
    });
  }
}
