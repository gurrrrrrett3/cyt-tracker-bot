import Logger from "../../utils/logger";
import Util from "../../utils/utils";
import MapDatabaseManager from "./mapDatabaseManager";
import PlayerSessionManager from "./sessions/playerSessionManager";

export default class MapEventManager {
  public static async playerEvents(
    oldPlayers: MapPlayersReturn,
    newPlayers: MapPlayersReturn, first = false
  ): Promise<void> {
    const playersJoined = newPlayers.players.filter(
      (player) => !oldPlayers.players.some((oldPlayer) => oldPlayer.uuid === player.uuid)
    );
    const playersLeft = oldPlayers.players.filter(
      (player) => !newPlayers.players.some((newPlayer) => newPlayer.uuid === player.uuid)
    );

    for (const player of playersJoined) {
      PlayerSessionManager.onJoin(player);
      // Logger.log("MapEventHandler", `${player.name} joined the server`);
    }
 
    for (const player of playersLeft) {
      PlayerSessionManager.onLeave(player);
       // Logger.log("MapEventHandler", `${player.name} left the server`);
    }

    for (const player of oldPlayers.players) {
      const nPlayer = newPlayers.players.find((p) => p.uuid === player.uuid);
      if (!nPlayer) continue;
      const distance = Util.distance(player.x, player.z, nPlayer.x, nPlayer.z);
      if (distance > 150 || player.world !=  nPlayer.world) {
        MapDatabaseManager.onTeleport(player, nPlayer);
      }

    }

    
    
  }
}
