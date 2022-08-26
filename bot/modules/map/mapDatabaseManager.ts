import { bot, db } from "../../..";
import Util from "../../utils/utils";
import Player from "./resources/player";
import Town from "./resources/town";
import { Player as pPlayer, Session } from "@prisma/client";

export default class MapDatabaseManager {
  public static async getPlayer(username: string, uuid?: string) {
    let dbPlayer = await db.player
      .findFirst({
        where: {
          username,
        },
        include: {
          Session: true,
        },
      })
      .catch((err) => console.error(err));

    if (dbPlayer?.uuid.startsWith("Invalid")) {
      const newPlayer = await db.player
        .update({
          where: {
            username,
          },
          data: {
            uuid: uuid || (await Util.getUUID(username)),
          },
          include: {
            Session: true,
          },
        })
        .catch((err) => console.error(err));

      if (newPlayer) {
        console.log(`Updated ${username}'s UUID, from ${dbPlayer.uuid} to ${newPlayer.uuid}`);
        dbPlayer = newPlayer;
      }
    }

    if (!dbPlayer) {
      console.log(`Creating db index for ${username}`);
      dbPlayer = await db.player
        .create({
          data: {
            uuid: uuid || (await Util.getUUID(username)),
            username,
          },
          include: {
            Session: true,
          },
        })
        .catch((err) => console.error(err));
    }
    return dbPlayer as pPlayer & {
      Session: Session[];
    };
  }

  public async getPlayerList() {
    return (await db.player.findMany()).map((player) => player.username);
  }

  public static async searchPlayer(
    name: string,
    options: {
      limit?: number;
      offset?: number;
    }
  ): Promise<string[]> {
    return (
      await db.player.findMany({
        where: {
          username: {
            contains: name,
          },
        },
        take: options.limit,
        skip: options.offset,
      })
    ).map((player) => player.username);
  }

  public static async getTown(town: Town) {
    let dbTown = await db.town
      .findFirst({
        where: {
          name: town.name,
        },
        include: {
          _count: true,
          assistants: true,
          coordinates: true,
          owner: true,
          residents: true,
        },
      })
      .catch((err) => console.error(err));

    if (!dbTown) {
      const owner = await this.getPlayer(town.mayor);
      if (!owner) return console.error(`Could not find owner for ${town.name}, skipping`);

      dbTown = await db.town
        .create({
          data: {
            name: town.name,
            nation: town.nation ?? "None",
            pvp: town.pvp,
            world: town.world,
            x: town.coords.x,
            z: town.coords.z,
            owner: {
              connect: {
                uuid: owner.uuid,
              },
            },
          },
          include: {
            _count: true,
            assistants: true,
            coordinates: true,
            owner: true,
            residents: true,
          },
        })
        .catch((err) => console.error(err));

      if (!dbTown) return;

      // fetch users that we do have
      const users = await db.player.findMany({
        where: {
          username: {
            in: town.residents,
          },
        },
      });

      const missingUsers = town.residents
        .filter((v) => !users.map((p) => p.username).includes(v))
        .map(async (u) => {
          return {
            u,
            i: await Util.getUUID(u),
          };
        });

      for await (const user of missingUsers) {
        await db.player
          .create({
            data: {
              username: user.u,
              uuid: user.i,
              residentTownid: dbTown.id,
              assistantTownId: town.assistants.includes(user.u) ? dbTown.id : undefined,
            },
          })
          .catch((err) => console.error(err));
      }

      // set assistant status

      await db.player
        .updateMany({
          where: {
            AND: {
              residentTownid: dbTown.id,
              username: {
                in: town.assistants,
              },
            },
          },
          data: {
            assistantTownId: dbTown.id,
          },
        })
        .catch((err) => console.error(err));
    }

    return dbTown;
  }

  public static async onTeleport(oldPlayer: Player, newPlayer: Player) {
    const player = await this.getPlayer(oldPlayer.name);
    return await db.teleport
      .create({
        data: {
          playerId: player.id,
          from: oldPlayer.getLocation(),
          to: newPlayer.getLocation(),
        },
      })
      .catch((err) => console.error(err));
  }

  public static async cleanPlayers() {
    const players = await db.player.findMany({
      where: {
        uuid: {
          contains: "Invalid",
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // ramdomze the order of the players and grab the first 10

    const batch = Util.randomizeArray(players).slice(0, 10);

    if (players.length === 0) return

    const uuids = await Util.getBatchUUIDs(batch.map((p) => p.username));

    for await (const uuid of uuids) {
     await db.player.update({
        where: {
          username: uuid.name,
        },
        data: {
          uuid: uuid.id,
        },
      }).catch((err) => console.error(err));

      // remove this player from the batch
      batch.splice(batch.findIndex((p) => p.username === uuid.name), 1);
    }

    // update the uuid of the remaining players
    for await (const player of batch) {
      await db.player.update({
        where: {
          username: player.username,
        },
        data: {
          uuid: `Old-${player.username}`,
        },
      }).catch((err) => console.error(err));
    }

    return console.log(`Cleaned ${uuids.length} players`);
  }
}
