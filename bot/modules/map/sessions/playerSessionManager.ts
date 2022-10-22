import { db } from "../../../..";
import Logger from "../../../utils/logger";
import MapDatabaseManager from "../mapDatabaseManager";
import Player from "../resources/player";

export default class PlayerSessionManager {
  public static async onJoin(player: Player) {
    const dbPlayer = await MapDatabaseManager.getPlayer(player.name, player.uuid);
    if (!dbPlayer) return;
    const session = await db.session
      .create({
        data: {
          playerId: dbPlayer.id,
          loginLocation: player.getLocation(),
        },
        include: {
          player: true,
        },
      })
      .catch((err) => console.error(err));

     // Logger.log("PlayerSessionManager", `Created session for ${player.name}, id: ${session?.id}`);

    return session;
  }

  public static async onLeave(player: Player) {
    const dbPlayer = await MapDatabaseManager.getPlayer(player.name, player.uuid);
    if (!dbPlayer) return;
    const session = await db.session
      .findFirst({
        where: {
          playerId: dbPlayer.id,
          isOnline: true,
        },
        include: {
          player: true,
        },
      })
      .catch((err) => console.error(err));

    if (session) {
      await db.session
        .update({
          data: {
            isOnline: false,
            logoutLocation: player.getLocation(),
          },
          where: {
            id: session.id,
          },
        })
        .catch((err) => console.error(err))
    } else {
      // Logger.log("PlayerSessionManager", `Could not find linked session for ${player.name}, removing from database`);
      await db.session.deleteMany({
        where: {
          playerId: dbPlayer.id,
          isOnline: true,
        },
      });
    }
  }

  public static async cleanSessions() {
    const sessions = await db.session
      .deleteMany({
        where: {
          isOnline: true,
        },
      })
      .catch((err) => console.error(err));

    if (sessions) Logger.log("PlayerSessionManager", `Cleaned ${sessions.count} sessions`);

    return sessions;
  }
}
