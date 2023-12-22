import { db } from "../../..";
import Time from "../../utils/time";

export default class TrankManager {
  public static async getAllTeleportsByCoords(world: string, x: number, z: number, radius: number = 5) {
    const tranks = await db.teleport.findMany({
      where: {
        to: {
          AND: {
            world: world,
            x: {
              gte: x - radius,
              lte: x + radius,
            },
            z: {
              gte: z - radius,
              lte: z + radius,
            },
          },
        },
      },
      include: {
        from: true,
        to: true,
        player: true,
      },
    });
    return tranks;
  }

  public static async getTrankByName(name: string) {
    const trank = await db.trank.findUnique({
      where: {
        name: name
      },
    });
    return trank;
  }

  public static async searchTranks(name: string) {
    const tranks = await db.trank.findMany();
    const results = tranks.filter((trank) => trank.name.toLowerCase().includes(name.toLowerCase()));
    return results
  }

  public static async getTrankData(name: string) {
    const data = await this.getTrankByName(name);
    if (!data) return null;

    const teleports = await this.getAllTeleportsByCoords(data.world, data.x, data.z);

    return {
      data,
      teleports,
    };
  }

    public static async updateTrank(name: string, editor: string, data: { name?: string; description?: string; tags?: string }) {
        const trank = await this.getTrankByName(name);
        if (!trank) return null;

        await db.trank.update({
            where: {
                name: name,
            },
            data: {
                name: data.name ?? trank.name,
                description: data.description ?? trank.description,
                tags: data.tags ?? trank.tags,
                updatedBy: editor
            },
        });
    }

    public static async getTrankByCoords(world: string, x: number, z: number) {
        const trank = await db.trank.findFirst({
            where: {
                world: world,
                x: {
                    gte: x - 5,
                    lte: x + 5,
                },
                z: {
                    gte: z - 5,
                    lte: z + 5,
                }
            },
        });
        return trank   
    }

    public static async getTrankLeaderboard(duration: Time, limit: number = 10) {

        const tranks = await db.trank.findMany();
        const teleports = await db.teleport.findMany();
        

        return tranks;


    }
}
