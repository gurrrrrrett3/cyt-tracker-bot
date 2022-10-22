import { Trank as dbTrank } from "@prisma/client";
import { db } from "../../../..";
import Logger from "../../../utils/logger";

export default class Trank {
  public readonly id: string;
  public name: string;
  public description: string;
  public readonly location: {
    x: number;
    z: number;
    world: string;
  };
  public tags: string[];
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public updatedBy: string;

  private constructor(d: dbTrank) {
    this.id = d.id;
    this.name = d.name;
    this.description = d.description;

    this.location = {
      x: d.x,
      z: d.z,
      world: d.world,
    };
    this.tags = d.tags.split(",");
    this.createdAt = d.createdAt;
    this.updatedAt = d.updatedAt;
    this.updatedBy = d.updatedBy;
  }

  public static async get(loc: WorldLocation, radius: number = 5): Promise<Trank | undefined> {

      const minMax = {
        minX: loc.x - radius,
        maxX: loc.x + radius,
        minZ: loc.z - radius,
        maxZ: loc.z + radius,
      }

      const tranks = await db.trank.findMany({
        where: {
          x: {
            gte: minMax.minX,
            lte: minMax.maxX,
          },
          z: {
            gte: minMax.minZ,
            lte: minMax.maxZ,
          },
          world: loc.world,
        },
        orderBy: {
          updatedAt: "desc",
        }
      });

      //sort by distance
      return tranks.sort((a, b) => {
        const aDist = Math.sqrt(Math.pow(a.x - loc.x, 2) + Math.pow(a.z - loc.z, 2));
        const bDist = Math.sqrt(Math.pow(b.x - loc.x, 2) + Math.pow(b.z - loc.z, 2));
        return aDist - bDist;
      }).map((t) => new Trank(t))[0]
       
  }
   
  public static async create(loc: WorldLocation) {
    const trank = await db.trank.create({
      data: {
        name: `${loc.world}:${loc.x}:${loc.z}`,
        description: "",
        x: loc.x,
        z: loc.z,
        world: loc.world,
        tags: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        updatedBy: "System",
      },
    });

    Logger.log("Trank", `Created trank ${trank.name} at ${loc.x},${loc.z}`);

    return new Trank(trank);
  } 
}
