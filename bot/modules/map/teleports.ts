import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
  SlashCommandStringOption,
} from "discord.js";
import { db } from "../../..";
import MapDatabaseManager from "./mapDatabaseManager";
import PagedEmbed from "../../utils/pagedEmbed";
import Util from "../../utils/utils";

const Command = {
  enabled: true,
  builder: new SlashCommandBuilder()
    .setName("teleports")
    .setDescription("Get a player's teleport history")
    .addStringOption(
      new SlashCommandStringOption()
        .setName("player")
        .setDescription("The player to get the teleport history of")
        .setRequired(true)
        .setAutocomplete(true)
    ),
  handler: async (interaction: ChatInputCommandInteraction) => {
    const player = await MapDatabaseManager.getPlayer(interaction.options.getString("player", true));

    const teleports = await db.teleport.findMany({
      where: {
        playerId: player.id,
      },
      include: {
        from: true,
        to: true,
      },
      orderBy: {
        time: "desc",
      },
    });

    const generatedAt = new Date();

    const useCounts: {
      world: string;
      x: number;
      z: number;
      count: number;
    }[] = [];

    // Make a list of all the telports with the count of how many times they were used
    for (const teleport of teleports) {
        const index = useCounts.findIndex((t) => t.world === teleport.to?.world && t.x === teleport.to?.x && t.z === teleport.to?.z);
        if (index === -1) {
            useCounts.push({
                world: teleport.to?.world as string,
                x: teleport.to?.x as number,
                z: teleport.to?.z as number,
                count: 1,
            });
        } else {
            useCounts[index].count++;
        }
    }
            

    new PagedEmbed(
      interaction,
      async (page) => {
        const teleport = teleports[page];

        const embed = new EmbedBuilder()
          .setTitle(`${player.username}'s Teleport History`)
          .setDescription(
            [
              `**${teleports.length}** total teleports`,
              `This data was generated at ${Util.formatDiscordTime(
                generatedAt,
                "longDateTime"
              )} (${Util.formatDiscordTime(generatedAt, "relative")})`,
              ``,
              `\`${page + 1}\`/\`${teleports.length}\``,
              ``,
              `\`${teleport.from?.world}: ${teleport.from?.x},${teleport.from?.z}\` **to** \`${teleport.to?.world}: ${teleport.to?.x},${teleport.to?.z}\``,
              `${Util.formatDiscordTime(teleport.time, "longDateTime")} (${Util.formatDiscordTime(
                teleport.time,
                "relative"
              )})`,
              ``,
              ` **${player.username}** has teleported here \`${
                useCounts.find(
                  (c) => c.world === teleport.to?.world && c.x === teleport.to?.x && c.z === teleport.to?.z
                )?.count
              }\` times`,
              ``,
              `**ID:** ${teleport.id}`,
            ].join("\n")
          )
          .setColor(0x00ae86);

        return embed;
      },
      {
        pageCount: teleports.length - 1,
        firstLastButtons: true,
      }
    );
  },
};

export default Command;
