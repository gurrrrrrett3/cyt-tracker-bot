export default class Player {
    
    public uuid: string;
    public name: string;
    public world: string;
    public x: number;
    public z: number;
    public yaw: number;
    public health: number;
    public armor: number;

    constructor(uuid: string, name: string, world: string, x: number, z: number, yaw: number, health: number, armor: number) {
        this.uuid = uuid;
        this.name = name;
        this.world = world;
        this.x = x;
        this.z = z;
        this.yaw = yaw;
        this.health = health;
        this.armor = armor;
    }

    public static fromMapPlayer(player: MapPlayer): Player {
        return new Player(player.uuid, player.name, player.world, player.x, player.z, player.yaw, player.health, player.armor);
    }

    public isAfk(): boolean {
        return (this.x === 0 && this.z === 0) || (this.x == 24 && this.z == 43);
    } 

    public getLocation(): DatabaseLocation {
        return `${this.world}:${this.x}:${this.z}`;
    }

    public getWorldLocation(): WorldLocation {
        return {
            world: this.world,
            x: this.x,
            z: this.z,
        }
    }

}