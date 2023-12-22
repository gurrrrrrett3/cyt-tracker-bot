import Bot from "../../bot";
import Module from "../../loaders/base/module";
import ws from "ws";
import MapModule from "../map";
import MapConnection from "../map/mapConnection";
import MapCanvas from "../map/mapCanvas";
import Logger from "../../utils/logger";

export default class WsModule extends Module {
  name = "ws";
  description = "";

  // declare other public variables here

  ws!: ws;

  override async onLoad(): Promise<Boolean> {

    return true;
    this.ws = new ws("ws://95.216.205.34:3001/")
    this.ws.on("open", () => {
      this.ws.send("botserver:ready");
      Logger.log("WS", "Connected to websocket server");
    })  
    this.ws.on("message", (data) => {
        this.dataHandler(data.toString())
    })

    return true;
  }

 async dataHandler(data: string) {
    const id = data.split(":")[0];
    const d = JSON.parse(data.split(":").slice(1).join(":")) as {
      type: string;
      [key: string]: any;
    };

    Logger.log("WS",`${id} ${d.type}`);

    switch (d.type) {
      case "onlineList":
        this.sendData(id, MapModule.getMapModule().mm.currentPlayerData);
        break;
      case "townList":
        this.sendData(id, await MapModule.getMapModule().mm.getTownList());
        break;
        case "playerList":
        this.sendData(id, await MapModule.getMapModule().mm.getPlayerList());
        break;
        case "teleportList":
        this.sendData(id, await MapModule.getMapModule().mm.getTeleportList());
        break;
        case "sessionList":
        this.sendData(id, await MapModule.getMapModule().mm.getSessionList());
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
        this.sendData(id, await MapModule.getMapModule().mm.getTicker());
      default:
        this.sendData(id, { error: "Invalid type" });
        break;
    }
  }

   sendData(id: string, data: Object | Array<any>) {
    Logger.log("WS", `Sending data of length ${JSON.stringify(data).length} to ${id}`);
    this.ws.send(`botserver:${id}:${JSON.stringify(data)}`);
  }

   static getWebsocketModule(bot: Bot): WsModule {
    return bot.moduleLoader.getModule("ws") as unknown as WsModule;
  }
}
