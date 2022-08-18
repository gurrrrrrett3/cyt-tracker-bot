import { ActivityType } from "discord.js";
import { bot } from "../../..";
import Time from "../../utils/time";
import MapConnection from "./mapConnection";
import MapEventManager from "./mapEnventHandler";
import PlayerSessionManager from "./sessions/playerSessionManager";

export default class MapManager {
  public currentPlayerData: MapPlayersReturn;
  public timer: NodeJS.Timer;
  public townTimer: NodeJS.Timer
  public isSaving: boolean = false

  constructor() {
    this.currentPlayerData = {
      players: [],
      max: 0,
    };

    setTimeout(PlayerSessionManager.cleanSessions, new Time("10 Seconds").ms())

    this.timer = setInterval(async () => {
      const newData = await MapConnection.getPlayers();

      MapEventManager.playerEvents(this.currentPlayerData, newData, this.currentPlayerData.max == 0);
      this.currentPlayerData = newData;
    }, new Time("1 second").ms());

    this.townTimer = setInterval(async () => {
      this.isSaving = true
      await MapConnection.getTowns()
      this.isSaving = false
    }, new Time("5 minutes").ms())

    MapConnection.getTowns()
  }
}
