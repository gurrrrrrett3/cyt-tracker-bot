import Bot from "../../bot";
import BaseModule from "../../loaders/base/baseModule";
import { Module } from "../../loaders/loaderTypes";

import ws from "ws";
import MapModule from "../map";
import { bot, db } from "../../..";
import MapConnection from "../map/mapConnection";
import MapCanvas from "../map/mapCanvas";

export default class WebsocketModule extends BaseModule implements Module {
  name = "Websocket";
  description = "";

  // declare other public variables here

  ws: ws;

  constructor(bot: Bot) {
    super(bot);
        this.ws = new ws("ws://localhost:3001")
        this.ws.on("open", () => {
          this.ws.send("botserver:ready");
        })  
        this.ws.on("message", (data) => {
            this.dataHandler(data.toString())
        })
    
  }

  async init(bot: Bot) {
    // init code here, this is called when the module is loaded
  }

  public async dataHandler(data: string) {
    const id = data.split(":")[0];
    const d = JSON.parse(data.split(":").slice(1).join(":")) as {
      type: string;
      [key: string]: any;
    };

    console.log(`[WS] ${id} ${d.type}`);

    switch (d.type) {
      case "onlineList":
        this.sendData(id, MapModule.getMapModule(bot).mm.currentPlayerData);
        break;
      case "townList":
        this.sendData(id, await MapModule.getMapModule(bot).mm.getTownList());
        break;
        case "playerList":
        this.sendData(id, await MapModule.getMapModule(bot).mm.getPlayerList());
        break;
        case "teleportList":
        this.sendData(id, await MapModule.getMapModule(bot).mm.getTeleportList());
        break;
        case "sessionList":
        this.sendData(id, await MapModule.getMapModule(bot).mm.getSessionList());
        break;
        case "mapTile":
        this.sendData(id, await MapConnection.getMapTileAtCoordsAsDataURI(d.world, d.x, d.y, d.zoom));
        break
        case "mapThumbnail":
        this.sendData(id, await MapCanvas.drawMapThumbnail(d.world, d.x, d.y, d.zoom));
        break
        case "playerMapThumbnail":
        this.sendData(id, await MapCanvas.drawPlayerMapThumbnail(d.world, d.x, d.y, d.zoom, d.yaw));
        break
        case "ticker":
        this.sendData(id, await MapModule.getMapModule(bot).mm.getTicker());
      default:
        this.sendData(id, { error: "Invalid type" });
        break;
    }
  }

  public sendData(id: string, data: Object | Array<any>) {
    console.log(`[WS] Sending data of length ${JSON.stringify(data).length} to ${id}`);
    this.ws.send(`botserver:${id}:${JSON.stringify(data)}`);
  }

  public static getWebsocketModule(bot: Bot): WebsocketModule {
    return bot.moduleLoader.getModule("Websocket") as WebsocketModule;
  }
}
