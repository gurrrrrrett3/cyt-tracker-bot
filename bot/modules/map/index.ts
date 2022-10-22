import { ActivityType } from "discord.js";
import { bot, db } from "../../..";
import Bot from "../../bot";
import Module from "../../loaders/base/module";
import Logger from "../../utils/logger";
import Time from "../../utils/time";
import Util from "../../utils/utils";
import MapManager from "./mapManager";
import MapUpdateManager from "./updateManager";

export default class MapModule extends Module {
  name = "map";
  description = "Manage connecting to the cyt map";

  mm!: MapManager
  um?: MapUpdateManager

  statusTimer: NodeJS.Timer | undefined

  static getMapModule(): MapModule {
    return bot.moduleLoader.getModule("map") as MapModule;
  }

  override async onUnload(): Promise<boolean> {
    // handle unloading resources and stopping timers
    
    clearInterval(this.statusTimer);
    clearInterval(this.mm.timer);
    clearInterval(this.mm.townTimer)

    Logger.log("Unloaded Map module!");
    return true;
  }

  override async onLoad(): Promise<boolean> {
    
    this.mm = new MapManager();

    let i = 0;
    this.statusTimer =  setInterval(async () => {
      if (this.mm.isSaving) {
        bot.client.user?.setActivity({
          type: ActivityType.Streaming,
          name: "data | SAVING | commands may be unresponsive",
        });
        return;
      }
      switch (i) {
        case 0:
          bot.client.user?.setActivity({
            type: ActivityType.Playing,
            name: `on CYT | ${this.mm.currentPlayerData.players.length} online`,
          });
          break;
        case 1:
          bot.client.user?.setActivity({
            type: ActivityType.Playing,
            name: `on CYT | Visiting ${(await db.town.findMany()).length} Towns`,
          });
          break;
        case 2:
          bot.client.user?.setActivity({
            type: ActivityType.Playing,
            name: `on CYT | Watching ${Util.kFormat((await db.player.findMany()).length)} Players`,
          });
          break;
        case 3:
          bot.client.user?.setActivity({
            type: ActivityType.Playing,
            name: `on CYT | Searching ${Util.kFormat((await db.teleport.findMany()).length)} Teleports`,
          });
          break;
        case 4:
          bot.client.user?.setActivity({
            type: ActivityType.Playing,
            name: `on CYT | Tracking ${Util.kFormat((await db.session.findMany()).length)} Sessions`,
          });
      }
      i++;
      i = i > 4 ? 0 : i;
    }, 5000);

    this.um = new MapUpdateManager();
    Logger.log("MapModule", "Loaded Map module!");
    return true;
  }
}
