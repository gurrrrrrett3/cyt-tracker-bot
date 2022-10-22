import fetch from "node-fetch";
import Logger from "../../utils/logger";
import MapParser from "./mapParser";
import Player from "./resources/player";

export default class MapConnection {
  public static readonly BASE_URL = "https://map.craftyourtown.com/tiles/";

  public static async getPlayers() {
    const response = await fetch(MapConnection.BASE_URL + "players.json");
    const json = (await response.json()) as MapPlayersReturn;
    return {
      players: json.players.map((player) => Player.fromMapPlayer(player)),
      max: json.max,
    };
  }

  public static async getTowns() {
    const worldList = ["world", "earth"];

    for (const world of worldList) {
      const response = await fetch(`${MapConnection.BASE_URL}${world}/markers.json`);
      const json = (await response.json()) as MarkerFile;
      const towns = MapParser.parseMarkerFile(world, json)

      for (const town of towns) {
        // Logger.log("MapConnection", `Saving ${town.name}`)
        await town.toDb()
      }
    }
  }

  public static getTileURL(world: string, x: number, y: number, zoom: 0 | 1 | 2 | 3) {
    return `${MapConnection.BASE_URL}${world}/${zoom}/${x}_${y}.png`;
  }

  public static getMapTileAtCoords(world: string, x: number, y: number, zoom: 0 | 1 | 2 | 3) {
    
    // 3 is 1 block per pixel
    // 2 is 2 blocks per pixel
    // 1 is 4 blocks per pixel
    // 0 is 8 blocks per pixel

    // all tiles are 512x512

    // therefore
    // 3 is 512x512
    // 2 is 1024x1024
    // 1 is 2048x2048
    // 0 is 4096x4096

    const tileSizes = [4096, 2048, 1024, 512];
    const tileSize = tileSizes[zoom];

    const tileX = Math.floor(x / tileSize);
    const tileY = Math.floor(y / tileSize);
    
    return this.getTileURL(world, tileX, tileY, zoom);
  }

  public static async getMapTileAtCoordsAsDataURI(world: string, x: number, y: number, zoom: 0 | 1 | 2 | 3) {
    const response = await fetch(MapConnection.getMapTileAtCoords(world, x, y, zoom));
    const buffer = await response.buffer();
    return `data:image/png;base64,${buffer.toString("base64")}`;
  }

  public static async getMapTileAtCoordsAsBuffer(world: string, x: number, y: number, zoom: 0 | 1 | 2 | 3) {
    const response = await fetch(MapConnection.getMapTileAtCoords(world, x, y, zoom));
    return await response.buffer();
  }
}
