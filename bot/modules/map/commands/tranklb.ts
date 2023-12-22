import { ChatInputCommandInteraction, Colors, EmbedBuilder } from "discord.js"
import { db } from "../../../..";
import Util from "../../../utils/utils";
import PagedEmbed from "../../../utils/pagedEmbed";
import SlashCommandBuilder from "../../../loaders/objects/customSlashCommandBuilder";
import { Trank } from "@prisma/client";

const Command = new SlashCommandBuilder()
    .setName('tranklb')
    .setDescription('View the teleport rank leaderboard')
    .addIntegerOption(o => o.setName('duration').setDescription('The duration the leaderboard represnts').addChoices(
        {
            name: 'All Time',
            value: 0
        },
        {
            name: 'Last 24 Hours',
            value: 1
        },
        {
            name: 'Last 7 Days',
            value: 2
        },
        {
            name: 'Last 30 Days',
            value: 3
        },
        {
            name: 'Last 90 Days',
            value: 4
        },
        {
            name: 'Last 180 Days',
            value: 5
        },
        {
            name: 'Last 365 Days',
            value: 6
        }
    ))

    .setFunction(async (interaction: ChatInputCommandInteraction) => {

        const duration = interaction.options.getInteger('duration') || 0

        const durationMap = {
            0: 0,
            1: 86400,
            2: 604800,
            3: 2592000,
            4: 7776000,
            5: 15552000,
            6: 31536000
        }

        await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Teleport Rank Leaderboard')
                    .setDescription('Aggregating data... <a:brogcube:1187777713491169362>')
                    .setColor(Colors.Yellow)
                    .toJSON()
            ]
        })

        const tRanks = await db.trank.findMany()
        const teleports = await db.teleport.findMany({
            where: {
                time: {
                    gte: new Date(duration != 0 ? Date.now() - durationMap[duration as keyof typeof durationMap] * 1000 : 0)
                }
            },
            include: {
                to: true
            }
        })

        interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Teleport Rank Leaderboard')
                    .setDescription(`Aggregating data from ${Util.kFormat(tRanks.length)} tranks and ${Util.kFormat(teleports.length)} teleports... <a:brogcube:1187777713491169362>`)
                    .setColor(Colors.Yellow)
                    .toJSON()
            ]
        })

        const tRankMap = new Map<string, {
            t: Trank,
            count: number
        }>(tRanks.map(t => [`${t.world} ${t.x} ${t.z}`, {
            t,
            count: 0
        }]))


        teleports.forEach(teleport => {
            if (!teleport.to) return
            const coords = `${teleport.to.world} ${teleport.to.x} ${teleport.to.z}`
            if (tRankMap.has(coords)) {
                tRankMap.get(coords)!.count++
            } 
        })


        // sort teleports by most teleported

        const sortedTranks = [...tRankMap.entries()].sort((a, b) => b[1].count - a[1].count)

        // build embed

        new PagedEmbed(interaction, async (page) => {
            return new EmbedBuilder()
                .setTitle('Teleport Rank Leaderboard')
                .setDescription(sortedTranks.slice(page * 10, page * 10 + 10).map((rank, index) => {

                    return rank[1].t.world == 'minecraft_overworld' ? `${index + 1 + page * 10}. [${rank[1].t.world.replace("minecraft_", "")}: ${rank[1].t.x}, ${rank[1].t.z}](${Util.getMapURL(rank[1].t.world, rank[1].t.x, rank[1].t.z, 5)}) - ${rank[1].count} teleports` : `${index + 1 + page * 10}. ${rank[1].t.world.replace("minecraft_", "")}: ${rank[1].t.x}, ${rank[1].t.z} - ${rank[1].count} teleports`
                }).join('\n'))
                .setColor(Colors.Yellow)
                .setTimestamp(new Date())
        }, {
            edit: true,
            refreshButton: false,
            pageCount: Math.ceil(sortedTranks.length / 10),
            footer: true,
            extraFooterText: `Aggregated from ${Util.kFormat(tRanks.length)} tranks and ${Util.kFormat(teleports.length)} teleports`
        })

    })



export default Command;