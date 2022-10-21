import { bot, db } from "../../..";
import Util from "../../utils/utils";
import Player from "./resources/player";
import Town from "./resources/town";
import { Player as pPlayer, Session, TownCoordinates, Town as pTown } from "@prisma/client";
import Trank from "./resources/trank";

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
    }

    for await (const resident of town.residents) {
      const dbResident = await this.getPlayer(resident);
      if (!dbResident) return console.error(`Could not find resident ${resident} for ${town.name}, skipping`);

      await db.player.update({
        where: {
          username: resident,
        },
        data: {
          residentOf: {
            connect: {
              name: town.name,
            },
          },
        },
      });
    }

    return dbTown;
  }

  public static async onTeleport(oldPlayer: Player, newPlayer: Player) {
    const player = await this.getPlayer(oldPlayer.name);
    const teleport = await db.teleport
      .create({
        data: {
          player: {
            connect: {
              id: player?.id,
            },
          },
          from: {
            create: {
              world: oldPlayer.world,
              x: oldPlayer.x,
              z: oldPlayer.z,
            },
          },
          to: {
            create: {
              world: newPlayer.world,
              x: newPlayer.x,
              z: newPlayer.z,
            },
          },
        },
      })
      .catch((err) => console.error(err));

    // check teleport rank for newLocation

    const trank = await Trank.get(newPlayer);
    if (!trank) {
      await Trank.create(newPlayer);
    }
  }

  public static async cleanPlayers() {
    let erroredOut = false;
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

    if (players.length === 0) return true;

    const uuids = await Util.getBatchUUIDs(batch.map((p) => p.username));

    if (uuids.length == 0) {
      erroredOut = true;
    }

    for await (const uuid of uuids) {
      await db.player
        .update({
          where: {
            username: uuid.name,
          },
          data: {
            uuid: uuid.id,
          },
        })
        .catch((err) => {
          erroredOut = true;
        });

      // remove this player from the batch
      batch.splice(
        batch.findIndex((p) => p.username === uuid.name),
        1
      );
    }

    // update the uuid of the remaining players
    for await (const player of batch) {
      await db.player
        .update({
          where: {
            username: player.username,
          },
          data: {
            uuid: `Old-${player.username}`,
          },
        })
        .catch((err) => {
          erroredOut = true;
        });
    }

    return erroredOut;
  }

  static async convertTownData(
    ...data: (pTown & {
      assistants: pPlayer[];
      residents: pPlayer[];
      coordinates: TownCoordinates[];
      owner: pPlayer;
    })[]
  ) {
    return data.map((town) => {
      return new Town(town.world, {
        name: town.name,
        nation: town.nation || "None",
        pvp: town.pvp,
        coords: {
          x: town.x,
          z: town.z,
        },
        assistants: town.assistants.map((a) => a.username),
        residents: town.residents.map((r) => r.username),
        mayor: town.owner.username,
        polygon: [],
      });
    });
  }

  static async getTownByName(name: string): Promise<Town | undefined> {
    const town = await db.town.findFirst({
      where: {
        name: name,
      },
      include: {
        owner: true,
        residents: true,
        assistants: true,
        coordinates: true,
      },
    });

    if (!town) return;

    return (await this.convertTownData(town)).at(0);
  }
}
