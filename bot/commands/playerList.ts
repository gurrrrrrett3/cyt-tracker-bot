import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
  SlashCommandStringOption,
} from "discord.js";
import { db } from "../..";
import PagedEmbed from "../utils/pagedEmbed";
import Util from "../utils/utils";

const Command = {
  enabled: true,
  builder: new SlashCommandBuilder()
    .setName("playerlist")
    .setDescription("Get the entire databse of players in the bot")
    .addStringOption(
      new SlashCommandStringOption().setName("sortmode").setDescription("The sort mode to use").addChoices(
        {
          name: "Name",
          value: "username",
        },
        {
          name: "updatedAt",
          value: "updatedAt",
        },
        {
          name: "createdAt",
          value: "createdAt",
        }
      )
    ),
  handler: async (interaction: ChatInputCommandInteraction) => {
    const options = interaction.options;
    const sortmode = options.getString("sortmode", false) || "username";

    const players = await db.player.findMany({
      orderBy: {
        [sortmode]: "asc",
      },
    });

    const playersPerPage = 10;
    new PagedEmbed(
      interaction,
      async (page) => {
        const offset = playersPerPage * (page - 1);
        const pagedPlayers = players.slice(offset, playersPerPage * page - 1);
        const embed = new EmbedBuilder().setTitle("Player List").setDescription(
          `\`${players.length}\` Player${players.length != 1 ? "s" : ""} in database\n\n\`\`\`` +
            pagedPlayers
              .map((p, i) => {
                return `${i + offset + 1}: ${p.username}`;
              })
              .join("\n") + "\n```"
        );

        return embed;
      },
      {
        currentPage: 1,
        firstLastButtons: true,
        footer: true,
        pageCount: Math.ceil(players.length / playersPerPage) || 1,
        refreshButton: false,
      }
    );
  },
};

export default Command;
