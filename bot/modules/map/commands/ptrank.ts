import { EmbedBuilder } from "discord.js";
import { db } from "../../../..";
import Util from "../../../utils/utils";
import SlashCommandBuilder from "../../../loaders/objects/customSlashCommandBuilder";
import MapDatabaseManager from "../mapDatabaseManager";

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

    interaction.reply({
        embeds: [
            new EmbedBuilder()
              .setTitle(`Teleports for ${player.username}`)
              .setDescription(sortedCounts.map((v) => `\`${v.count} | ${v.world}:${v.x},${v.z}\``).join("\n") || "No teleports found")
              .setTimestamp(generatedAt)
        ]
    })
  });

export default Command;
