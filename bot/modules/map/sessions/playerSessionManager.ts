import { db } from "../../../..";
import MapDatabaseManager from "../mapDatabaseManager";
import Player from "../resources/player";

export default class PlayerSessionManager {
  public static async onJoin(player: Player) {
    const dbPlayer = await MapDatabaseManager.getPlayer(player.name, player.uuid);
    if (!dbPlayer) return;
    const session = await db.session.create({
      data: {
        playerId: dbPlayer.id,
        loginLocation: player.getLocation(),
      },
      include: {
        player: true,
      },
    }).catch((err) => console.error(err));

    return session;
  }

  public static async onLeave(player: Player) {
    const dbPlayer = await MapDatabaseManager.getPlayer(player.name, player.uuid);
    if (!dbPlayer) return;
    const session = await db.session.findFirst({
      where: {
        playerId: dbPlayer.id,
        isOnline: true,
      },
      include: {
        player: true,
      },
    }).catch((err) => console.error(err));

    if (session) {
      await db.session.update({
        data: {
          isOnline: false,
          logoutLocation: player.getLocation(),
        },
        where: {
          id: session.id,
        },
      }).catch((err) => console.error(err));
    }
  }

  public static async cleanSessions() {
    const sessions = await db.session.findMany({
      where: {
        isOnline: true,
      },
    }).catch((err) => console.error(err));

    if (!sessions) return

    for (const session of sessions) {
      await db.session.delete({
        where: {
          id: session.id,
        },
      }).catch((err) => console.error(err));
    }
  }
}
