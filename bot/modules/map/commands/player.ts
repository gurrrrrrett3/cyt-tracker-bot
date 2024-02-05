import {
  AttachmentBuilder,
  Colors,
  EmbedBuilder,
} from "discord.js";
import { db } from "../../../..";
import Util from "../../../utils/utils";
import SlashCommandBuilder from "../../../loaders/objects/customSlashCommandBuilder";
import MapDatabaseManager from "../mapDatabaseManager";
import MapCanvas from "../mapCanvas";
import MapModule from "..";

const emojis = {
  black: '⬛',
  red: '🟥',
  white: '⬜',
}

function bar(percent: number, length: number, bg: string, fg: string) {
  const fill = Math.floor(length * percent);
  const empty = length - fill;
  return `${fg.repeat(fill)}${bg.repeat(empty)}`
}

const Command = new SlashCommandBuilder()
  .setName("player")
  .setDescription("Get data for a player")
  .addStringOption(
    o => o
      .setName("player")
      .setDescription("The player to get data for")
      .setRequired(true)
      .setAutocomplete(async (interaction, input) => {
        const players = await MapDatabaseManager.searchPlayer(input, {
          limit: 25,
        })

        return players.map(player => ({
          name: player,
          value: player,
        }))
      })
  )
  .setFunction(async (interaction) => {

    await interaction.deferReply();

    const player = interaction.options.getString("player", true);

    const playerData = await db.player.findFirst({
      where: {
        username: {
          contains: player,
        },
      },
      include: {
        assistantOf: true,
        ownerOf: true,
        residentOf: true,
        Session: {
          orderBy: {
            startedAt: "desc",
          },
        },
      },
    });

    if (!playerData) {
      interaction.editReply({
        content: "No player found",
      });
      return;
    }

    const lastSession = playerData.Session[0];

    const onlineData = MapModule.getMapModule().mm.currentPlayerData.players.find((p) => p.name == playerData.username);

    const townRole = playerData.ownerOf ? "Owner" : playerData.assistantOf ? "Assistant" : playerData.residentOf ? "Resident" : undefined;
    const town = playerData.ownerOf ? playerData.ownerOf : playerData.assistantOf ? playerData.assistantOf : playerData.residentOf ? playerData.residentOf : undefined;

    const embed = new EmbedBuilder()
      .setTitle(playerData.username)
      .setDescription(
        [
          `${townRole} of ${town?.name ?? "N/A"} ${town?.nation ? `(${town.nation})` : ""} ${town ? `| [View on map](${Util.getMapURL(town.world, town.x, town.z)})` : ""}`,
          ``,
          `**First seen:** ${Util.formatDiscordTime(
            playerData.createdAt,
            "longDateTime"
          )} (${Util.formatDiscordTime(playerData.createdAt, "relative")})`,
          onlineData ? '**Currently online**' : lastSession ? `**Last seen:** ${Util.formatDiscordTime(
            playerData.updatedAt,
            "longDateTime"
          )} (${Util.formatDiscordTime(lastSession?.startedAt, "relative")})` : "No sessions found",
          ``,
          `**Total sessions:** ${playerData.Session.length ?? 0}`,
          '',
          `${playerData.username} is currently ${onlineData ? "online" : "offline"} in ${onlineData?.world.replace("minecraft_", '') ?? "N/A"}`,
          `${onlineData ? `**Coordinates:** ${onlineData.x}, ${onlineData.z}${onlineData.world == 'minecraft_overworld' ? ` | [View on map](${Util.getMapURL(onlineData.world, onlineData.x, onlineData.z)})` : ''}` : ""}`,
          `${onlineData ? `${bar(onlineData.health / 20, 20, emojis.black, emojis.red)} ${onlineData.health}/20` : ""}`,
          `${onlineData ? `${bar(onlineData.armor / 20, 20, emojis.black, emojis.white)} ${onlineData.armor}/20` : ""}`,
          '',
          `${onlineData && onlineData?.world != "minecraft_overworld" ? "Map image preview is not available for this world." : ""}`,
        ].join("\n")
      )
      .setFooter({
        text: `ID: ${playerData.id}`
      })
      .setColor(Colors.Blue)

    const attachment = onlineData?.world &&
      new AttachmentBuilder(
        await MapCanvas.drawPlayerThumbnail(onlineData, 3),
        {
          name: `${playerData.username}.png`,
        }
      );

    if (attachment) {
      embed.setImage(`attachment://${playerData.username}.png`);
    }


    interaction.editReply({
      embeds: [embed],
      files: attachment ? [attachment] : undefined,
    });
  });

export default Command;
