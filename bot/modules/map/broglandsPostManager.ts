import { Colors, EmbedBuilder, TextChannel } from "discord.js";
import { bot } from "../../..";
import Town from "./resources/town";
import MapModule from ".";
import Util from "../../utils/utils";
import Polygon from "./resources/polygon";

export default class BroglandsPostManager {

    public static readonly GUILD_ID = process.env.GUILD_ID;
    public static readonly CHANNELS = {
        NATION_ANNOUNCEMENTS: "1071547355867914343",
        NATION_UPDATES: "1187796463187669052",
        TOWN_UPDATES: "1187793715901763634",
    }
    public static readonly NATION_NAME = "Broglands";

    public static async handleTownUpdateData(data: {
        townsCreated: Town[],
        townsDeleted: Town[],
        townNationChanged: {town: Town, oldNation: string}[],
        townNameChanged: {town: Town, oldName: string}[],
        townCoordsChanged: {town: Town, oldCoords: Point}[],
        townOwnerChanged: {town: Town, oldOwner: string}[],
        townAssistantsChanged: {town: Town, residents: string[]}[],
        townResidentsChanged: {town: Town, residents: string[]}[],
        townClaimChanged: {
            town: Town,
            oldClaim: Polygon[]
        }[],
        nationsCreated: string[],
        nationsDeleted: string[],
    }) {

        const { townsCreated, townsDeleted, townNationChanged, townNameChanged, townCoordsChanged, townOwnerChanged, townAssistantsChanged, townResidentsChanged, townClaimChanged, nationsCreated, nationsDeleted } = data;

        const nationAnnouncementsChannel = bot.client.channels.cache.get(BroglandsPostManager.CHANNELS.NATION_ANNOUNCEMENTS) as TextChannel;
        const nationUpdatesChannel = bot.client.channels.cache.get(BroglandsPostManager.CHANNELS.NATION_UPDATES) as TextChannel;
        const townUpdatesChannel = bot.client.channels.cache.get(BroglandsPostManager.CHANNELS.TOWN_UPDATES) as TextChannel;

        const currentTowns = MapModule.getMapModule().mm.currentTownData;
        const broglandsTowns = currentTowns.filter((town) => town.nation === BroglandsPostManager.NATION_NAME);

        const nationStats = {
            towns: broglandsTowns.length,
            residents: broglandsTowns.reduce((acc, town) => acc + town.residents.length, 0),
            chunks: broglandsTowns.reduce((acc, town) => acc + (town.polygon?.reduce((acc, polygon) => acc + polygon.calcuateChunkArea(), 0) || 0), 0),
        }

        // town joined nation
        townNationChanged.filter((town) => town.town.nation === BroglandsPostManager.NATION_NAME).forEach((town) => {
            nationAnnouncementsChannel.send({
                content: `new town:\n${town.town.name} (by ${town.town.mayor})`
            })

            nationUpdatesChannel.send({
                embeds: [new EmbedBuilder()
                    .setTitle(`${town.town.name} has joined ${BroglandsPostManager.NATION_NAME}!`)
                    .setDescription(
                        [
                            `**Mayor: ${town.town.mayor}**`,
                            '',
                            nationStatChange(nationStats, town.town),
                        ].join("\n")
                    )
                    .setColor(Colors.Yellow)
                    .setTimestamp()
                ]})
        })

        // town left nation
        townNationChanged.filter((town) => town.town.nation !== BroglandsPostManager.NATION_NAME).forEach((town) => {
            nationUpdatesChannel.send({
                embeds: [new EmbedBuilder()
                    .setTitle(`${town.town.name} has left ${BroglandsPostManager.NATION_NAME} for ${town.town.nation} :(`)
                    .setDescription(
                        [
                            `**Mayor: ${town.town.mayor}**`,
                            '',
                            nationStatChange(nationStats, town.town, true),
                        ].join("\n")
                    )
                    .setColor(Colors.Yellow)
                    .setTimestamp()
                ]}) 
        })

        // // member joined nation town
        // townResidentsChanged.filter((town) => town.town.nation === BroglandsPostManager.NATION_NAME).forEach(async (town) => {
        //     town.residents.forEach(async (resident, index) => {
        //         townUpdatesChannel.send({
        //             embeds: [new EmbedBuilder()
        //                 .setTitle(`${town.town.name} has a new resident!`)
        //                 .setDescription(
        //                     [
        //                         `**${resident}**`,
        //                         '',
        //                         `**Residents**: \`${town.town.residents.length - town.residents.length + index}\` -> \`${town.town.residents.length - town.residents.length + index + 1}\``,
        //                     ].join("\n")
        //                 )
        //                 .setColor(Colors.Yellow)
        //                 .setTimestamp()
        //                 .setThumbnail(`https://crafthead.net/avatar/${await Util.getUUID(town.residents.slice(-1)[0])}?overlay=true`)
        //             ]}) 
        //     })
        // })

        // // member left nation town
        // townResidentsChanged.filter((town) => town.town.nation === BroglandsPostManager.NATION_NAME).forEach(async (town) => {
        //     town.residents.forEach(async (resident, index) => {
        //         townUpdatesChannel.send({
        //             embeds: [new EmbedBuilder()
        //                 .setTitle(`${town.town.name} has lost a resident!`)
        //                 .setDescription(
        //                     [
        //                         `**${resident}**`,
        //                         '',
        //                         `**Residents**: \`${town.town.residents.length + index}\` -> \`${town.town.residents.length + index - 1}\``,
        //                     ].join("\n")
        //                 )
        //                 .setColor(Colors.Yellow)
        //                 .setTimestamp()
        //                 .setThumbnail(`https://crafthead.net/avatar/${await Util.getUUID(town.residents.slice(-1)[0])}?overlay=true`)
        //             ]}) 
        //     })
        // })
        
    }

}

function nationStatChange(nationStats: {
    towns: number,
    residents: number,
    chunks: number
}, town: Town, removed: boolean = false): string {
    return removed ? [
        `**Towns**: \`${nationStats.towns}\` -> \`${nationStats.towns - 1}\``,
        `**Residents**: \`${nationStats.residents}\` -> \`${nationStats.residents - town.residents.length}\``,
        `**Chunks**: \`${nationStats.chunks}\` -> \`${nationStats.chunks - (town.polygon?.reduce((acc, polygon) => acc + polygon.calcuateChunkArea(), 0) || 0)}\``,
    ].join("\n") :  [
        `**Towns**: \`${nationStats.towns}\` -> \`${nationStats.towns + 1}\``,
        `**Residents**: \`${nationStats.residents}\` -> \`${nationStats.residents + town.residents.length}\``,
        `**Chunks**: \`${nationStats.chunks}\` -> \`${nationStats.chunks + (town.polygon?.reduce((acc, polygon) => acc + polygon.calcuateChunkArea(), 0) || 0)}\``,
    ].join("\n")
}