import Logger from "../../utils/logger";
import Util from "../../utils/utils";
import BroglandsPostManager from "./broglandsPostManager";
import MapDatabaseManager from "./mapDatabaseManager";
import Town from "./resources/town";
import PlayerSessionManager from "./sessions/playerSessionManager";

export default class MapEventManager {
  public static async playerEvents(
    oldPlayers: MapPlayersReturn,
    newPlayers: MapPlayersReturn, first = false
  ): Promise<void> {

    if (first) {
      Logger.log("MapEventHandler", "First player update, skipping events");
      return;
    }

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

  public static async townEvents(
    oldTowns: Town[],
    newTowns: Town[],
    first = false
  ): Promise<void> {
    if (first) {
      Logger.log("MapEventHandler", "First town update, skipping events");
      return;
    }

    const townsCreated = newTowns.filter(
      (town) => !oldTowns.some((oldTown) => oldTown.coords === town.coords)
    );

    const townsDeleted = oldTowns.filter(
      (town) => !newTowns.some((newTown) => newTown.coords === town.coords)
    );

    const townNationChanged = newTowns.filter(
      (town) => oldTowns.some((oldTown) => oldTown.coords === town.coords && oldTown.nation !== town.nation)
    ).map((town) => {
      return {
        town,
        oldNation: oldTowns.find((oldTown) => oldTown.coords === town.coords)?.nation!,
      }
    });

    const townNameChanged = newTowns.filter(
      (town) => oldTowns.some((oldTown) => oldTown.coords === town.coords && oldTown.name !== town.name)
    ).map((town) => {
      return {
        town,
        oldName: oldTowns.find((oldTown) => oldTown.coords === town.coords)?.name!,
      }
    })

    const townCoordsChanged = newTowns.filter(
      (town) => oldTowns.some((oldTown) => oldTown.name === town.name && oldTown.coords !== town.coords)
    ).map((town) => {
      return {
        town,
        oldCoords: oldTowns.find((oldTown) => oldTown.name === town.name)?.coords!,
      }
    })
    
    const townOwnerChanged = newTowns.filter(
      (town) => oldTowns.some((oldTown) => oldTown.coords === town.coords && oldTown.mayor !== town.mayor)
    ).map((town) => {
      return {
        town,
        oldOwner: oldTowns.find((oldTown) => oldTown.coords === town.coords)?.mayor!,
      }
    })

    const townAssistantsChanged = newTowns.filter(
      (town) => oldTowns.some((oldTown) => oldTown.coords === town.coords && oldTown.assistants !== town.assistants)
    ).map((town) => {
      return {
        town,
        residents: oldTowns.find((oldTown) => oldTown.coords === town.coords)?.assistants!,
      }
    })

    const townResidentsChanged = newTowns.filter(
      (town) => oldTowns.some((oldTown) => oldTown.coords === town.coords && oldTown.residents !== town.residents)
    ).map((town) => {
      return {
        town,
        residents: oldTowns.find((oldTown) => oldTown.coords === town.coords)?.residents!,
      }
    })

    const townClaimChanged = newTowns.filter(
      (town) => oldTowns.some((oldTown) => oldTown.coords === town.coords && oldTown.polygon !== town.polygon)
    ).map((town) => {
      return {
        town,
        oldClaim: oldTowns.find((oldTown) => oldTown.coords === town.coords)?.polygon!,
      }
    })

    const oldNations = new Set(oldTowns.map((town) => town.nation));
    const newNations = new Set(newTowns.map((town) => town.nation));

    const nationsCreated = [...newNations].filter((nation) => !oldNations.has(nation));
    const nationsDeleted = [...oldNations].filter((nation) => !newNations.has(nation));

    for (const ev of [
      townsCreated,
      townsDeleted,
      townNationChanged,
      townNameChanged,
      townCoordsChanged,
      townOwnerChanged,
      townAssistantsChanged,
      townResidentsChanged,
      townClaimChanged,
      nationsCreated,
      nationsDeleted
    ]) {
      if (ev.length > 0) {
        Logger.log("MapEventHandler", "Town update event detected");
        Logger.log("MapEventHandler", ev);
      }
    }

    BroglandsPostManager.handleTownUpdateData({
      townsCreated,
      townsDeleted,
      townNationChanged,
      townNameChanged,
      townCoordsChanged,
      townOwnerChanged,
      townAssistantsChanged,
      townResidentsChanged,
      townClaimChanged,
      nationsCreated,
      nationsDeleted,
    });
    
  }
}
