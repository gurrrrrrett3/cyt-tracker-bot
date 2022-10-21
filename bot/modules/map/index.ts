import { ActivityType } from "discord.js";
import { bot, db } from "../../..";
import Bot from "../../bot";
import BaseModule from "../../loaders/base/baseModule";
import Module from "../../loaders/base/module";
import Time from "../../utils/time";
import Util from "../../utils/utils";
import MapManager from "./mapManager";
import MapUpdateUpdateManager from "./updateManager";

export default class MapModule extends Module {
  name = "map";
  description = "Manage connecting to the cyt map";

  mm = new MapManager();
  um?: MapUpdateUpdateManager

  statusTimer: NodeJS.Timer

  constructor(bot: Bot) {
    super(bot);

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
  }

  static getMapModule(): MapModule {
    return bot.moduleLoader.getModule("map") as MapModule;
  }

  override async onUnload(): Promise<void> {
    // handle unloading resources and stopping timers
    
    clearInterval(this.statusTimer);
    clearInterval(this.mm.timer);
    clearInterval(this.mm.townTimer)

    console.log("Unloaded Map module!");
  }

  override async onLoad(): Promise<void> {

   setTimeout(async () => {
      this.um = new MapUpdateUpdateManager();
    },new Time("1 second").ms());
  }
}
