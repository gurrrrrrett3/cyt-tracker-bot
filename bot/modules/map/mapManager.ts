import { ActivityType } from "discord.js";
import { bot, db } from "../../..";
import Time from "../../utils/time";
import MapConnection from "./mapConnection";
import MapDatabaseManager from "./mapDatabaseManager";
import MapEventManager from "./mapEventHandler";
import PlayerSessionManager from "./sessions/playerSessionManager";

export default class MapManager {
  public currentPlayerData: MapPlayersReturn;
  public timer: NodeJS.Timer;
  public townTimer: NodeJS.Timer;
  public isSaving: boolean = false;

  constructor() {

    this.currentPlayerData = {
      players: [],
      max: 0,
    };

    setTimeout(PlayerSessionManager.cleanSessions, new Time("10 Seconds").ms());

    this.timer = setInterval(async () => {
      const newData = await MapConnection.getPlayers();

      MapEventManager.playerEvents(this.currentPlayerData, newData, this.currentPlayerData.max == 0);
      this.currentPlayerData = newData;
    }, new Time("1 second").ms());

    this.townTimer = setInterval(async () => {
      this.isSaving = true;
      // await MapConnection.getTowns();
      await MapDatabaseManager.cleanPlayers();
      this.isSaving = false;
    }, new Time("5 minutes").ms());

    // MapConnection.getTowns();
  }

  public async getTownList() {
    return await db.town.findMany({
      include: {
        owner: true,
        assistants: true,
        residents: true,
        coordinates: true,
        _count: true,
      },
    });
  }

  public async getTeleportList() {
    return await db.teleport.findMany({
      include: {
        player: true,
        from: true,
        to: true,
      },
    });
  }

  public async getPlayerList() {
    return await db.player.findMany({
      include: {
        _count: true,
        Session: true,
        teleports: true,
        assistantOf: true,
        residentOf: true,
        ownerOf: true,
      },
    });
  }

  public async getSessionList() {
    return await db.session.findMany({
      include: {
        player: true,
      },
    });
  }

  public async getTicker() {
    return `${this.currentPlayerData.players.length}/${this.currentPlayerData.max} Online | ${this.currentPlayerData.players.filter((p) => MapManager.isPlayerAfk(p)).length} AFK | Server time: ${new Date().getHours() + 5}:${new Date().getMinutes()}:${new Date().getSeconds()}`;
  }

  public static isPlayerAfk(player: MapPlayer) {
    return (player.x == 0 && player.z == 0) || (player.x == 25 && player.z == 42);
  }
}
