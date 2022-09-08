import { ActivityType } from "discord.js";
import { db } from "../../..";
import Bot from "../../bot";
import BaseModule from "../../loaders/base/baseModule";
import { Module } from "../../loaders/loaderTypes";
import Time from "../../utils/time";
import Util from "../../utils/utils";
import MapManager from "./mapManager";

export default class MapModule extends BaseModule implements Module {
  name = "Map";
  description = "Manages connection to the map";
  mm = new MapManager()

  // declare other public variables here

  constructor(bot: Bot) {
    super(bot);

    let i = 0
    setInterval(async () => {
      if (this.mm.isSaving) {
        bot.client.user?.setActivity({
          type: ActivityType.Streaming,
          name: "data | SAVING | commands may be unresponsive"
        })
        return
      } 
       switch (i) {
        case 0:
          bot.client.user?.setActivity({
            type: ActivityType.Playing,
            name: `on CYT | ${this.mm.currentPlayerData.players.length} online`
          })
          break
          case 1: 
          bot.client.user?.setActivity({
            type: ActivityType.Playing,
            name: `on CYT | Visiting ${(await db.town.findMany()).length} Towns`
          })
          break
          case 2: 
          bot.client.user?.setActivity({
            type: ActivityType.Playing,
            name: `on CYT | Watching ${Util.kFormat((await db.player.findMany()).length)} Players`
          })
          break
          case 3: 
          bot.client.user?.setActivity({
            type: ActivityType.Playing,
            name: `on CYT | Searching ${Util.kFormat((await db.teleport.findMany()).length)} Teleports`
          })
          break
          case 4:
            bot.client.user?.setActivity({
              type: ActivityType.Playing,
              name: `on CYT | Tracking ${Util.kFormat((await db.session.findMany()).length)} Sessions`
            })

       }
        i ++
        i = i >= 4 ? 0 : i
    }, 5000)
  }

  async init(bot: Bot) {
    // init code here, this is called when the module is loaded

  }

  public static getMapModule(bot: Bot): MapModule {
    return bot.moduleLoader.getModule("Map") as MapModule;
  }
}
