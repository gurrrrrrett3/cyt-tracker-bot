import { db } from "../../..";

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
        name: name,
      },
    });
    return trank;
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
}
