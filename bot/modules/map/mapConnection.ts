import fetch from "node-fetch";
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
        console.log(`Saving ${town.name}`)
        await town.toDb()
      }
    }
  }
}
