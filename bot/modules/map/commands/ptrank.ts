import { Colors, EmbedBuilder } from "discord.js";
import { db } from "../../../..";
import Util from "../../../utils/utils";
import SlashCommandBuilder from "../../../loaders/objects/customSlashCommandBuilder";
import MapDatabaseManager from "../mapDatabaseManager";
import PagedEmbed from "../../../utils/pagedEmbed";
import Time from "../../../utils/time";

const Command = new SlashCommandBuilder()
  .setName("ptrank")
  .setDescription("Get a player's top teleports")
  .addStringOption((o) =>
    o
      .setName("player")
      .setDescription("The player to get data for")
      .setRequired(true)
      .setAutocomplete(async (interaction, input) => {
        const players = await MapDatabaseManager.searchPlayer(input, {
          limit: 25,
        });

        return players.map((player) => ({
          name: player,
          value: player,
        }));
      })
  )
  .setFunction(async (interaction) => {
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
      const index = useCounts.findIndex(
        (t) => t.world === teleport.to?.world && t.x === teleport.to?.x && t.z === teleport.to?.z
      );
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

    const sortedCounts = useCounts.sort((a, b) => b.count - a.count) 

    new PagedEmbed(interaction, async (page) => {

      return new EmbedBuilder()
        .setTitle(`${player.username}'s Top Teleports`)
        .setDescription(
        await Promise.all(sortedCounts
            .slice(page * 10, page * 10 + 10)
            .map(async (t, index) => {
              
              const rank = await db.trank.findFirst({
                where: {
                  world: t.world,
                  x: t.x,
                  z: t.z
                }
              })

             if (!rank) return `**${index + 1 + page * 10}.** ${t.world.replace("minecraft_", "")}: ${t.x}, ${t.z} - ${Util.kFormat(t.count)} uses` 
              return `**${index + 1 + page * 10}.** ${rank.name} - ${Util.kFormat(t.count)} uses`

            }))
            .then((ranks) => ranks.join("\n"))
        )
        .setColor(Colors.Blue)
        .setTimestamp()
    }, {
      pageCount: Math.ceil(sortedCounts.length / 10),
      firstLastButtons: true,
      extraFooterText: `${Util.kFormat(teleports.length)} teleports in ${new Time(Date.now() - generatedAt.getTime()).toString(true)}`,
      footer: true,
    })
  });

export default Command;
