import { db } from "../../../..";
import MapDatabaseManager from "../mapDatabaseManager";
import Polygon from "./polygon";

export default class Town {
    
    public world: string;
    public name: string;
    public nation: string;
    public mayor: string;
    public pvp: boolean;
    public residents: string[];
    public assistants: string[];
    public capital: boolean;
    public outpost: boolean;
    public polygon: Polygon[] | undefined;
    public coords: {
        x: number;
        z: number;
    };

    constructor(world: string, data: TownData) {
        this.world = world;
        this.name = data.name;
        this.nation = data.nation;
        this.mayor = data.mayor;
        this.pvp = data.pvp;
        this.residents = data.residents;
        this.assistants = data.assistants;
        this.capital = data.capital || false;
        this.outpost = data.outpost || false;
        this.coords = data.coords;
        
        if (data.polygon) {
            this.polygon = data.polygon.map((d) => new Polygon(d.points))
        }

        if (this.assistants[0] == "None" && this.assistants.length == 1) {
            this.assistants = [];
        }
    }

    public getCoords(): Coords {
        return {
            x: this.coords.x,
            z: this.coords.z,
        };
    }

    public getLocation(): WorldLocation {
        return {
            world: this.world,
            x: this.coords.x,
            z: this.coords.z,
        };
    }

    public async toDb() {
        return await MapDatabaseManager.getTown(this)
    }
 
}
