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

    if (dbPlayer?.uuid.startsWith("Invalid") && uuid) {
      db.player.update({
        where: {
          username,
        },
        data: {
          uuid,
        },
      });
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
        await db.player.create({
          data: {
            username: user.u,
            uuid: user.i,
            residentTownid: dbTown.id,
            assistantTownId: town.assistants.includes(user.u) ? dbTown.id : undefined,
          },
        });
      }

      // set assistant status

      await db.player.updateMany({
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
      });
    }

    return dbTown;
  }

  public static async onTeleport(oldPlayer: Player, newPlayer: Player) {
    return await db.teleport.create({
      data: {
        player: {
          connectOrCreate: {
            where: {
              uuid: oldPlayer.uuid,
            },
            create: {
              username: oldPlayer.name,
              uuid: oldPlayer.uuid,
            }
          },
        },
        from: oldPlayer.getLocation(),
        to: newPlayer.getLocation(),
      }
    }).catch((err) => console.error(err));
  }
  
}