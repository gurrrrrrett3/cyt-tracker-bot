class Player {
  public uuid: string;
  public name: string;
  public world: string;
  public x: number;
  public z: number;
  public yaw: number;
  public health: number;
  public armor: number;

  constructor(
    uuid: string,
    name: string,
    world: string,
    x: number,
    z: number,
    yaw: number,
    health: number,
    armor: number
  );

  public static fromMapPlayer(player: MapPlayer): Player;
  public isAfk(): boolean;
  public getLocation(): DatabaseLocation;
  public getWorldLocation(): WorldLocation;
}

interface MapPlayersReturn {
  max: number;
  players: Player[];
}

interface MapPlayer {
  world: string;
  armor: number;
  name: string;
  x: number;
  health: number;
  z: number;
  uuid: string;
  yaw: number;
}

type DatabaseLocation = `${string}:${number}:${number}`;

interface Coords {
  x: number;
  z: number;
}

interface WorldLocation extends Coords {
  world: string;
}

class Polygon {
  public points: Point[];
  constructor(points: Point[]);
  public isInside(point: Point): boolean;
}

type MarkerFile = MarkerGroup[];

interface MarkerGroup {
  hide: boolean;
  z_index: number;
  name: string;
  control: boolean;
  id: string;
  markers: Marker[];
  order: number;
  timestamp: number;
}

interface Marker {
  color?: string;
  tooltip: string;
  type: "icon" | "polygon";
  points?: Point[][][];
  fillColor?: string;
  popup?: string;
  tooltip_anchor?: Point;
  size?: Point;
  anchor?: Point;
  icon?: string;
  point?: Point;
}

interface IconMarker {
  tooltip_anchor: Point;
  popup: string;
  size: Point;
  type: "icon";
  tooltip: string;
  anchor: Point;
  icon: string;
  point: Point;
}

interface Point {
  z: number;
  x: number;
}

interface PolygonMarker {
  fillColor: string;
  popup: string;
  color: string;
  tooltip: string;
  type: "polygon";
  points: Point[][][];
}

interface PolygonData {
  points: {
    x: number;
    z: number;
  }[];
}

interface TownData {
  name: string;
  nation: string;
  mayor: string;
  pvp: boolean;
  residents: string[];
  assistants: string[];
  capital?: boolean;
  outpost?: boolean;
  polygon: PolygonData[] | undefined;
  coords: {
    x: number;
    z: number;
  };
}

interface FullTownData extends TownData {
  world: string;
}

interface pObject {
  polygon: Polygon;
  name: string;
}

interface UpdateFrame {
  towns: {
    created: Town[];
    deleted: Town[];
  };
  assistants: {
    added: {
      town: Town;
      player: string;
    }[];
    removed: {
      town: Town;
      player: string;
    }[];
  };
  residents: {
    added: {
      town: Town;
      player: string;
    }[];
    removed: {
      town: Town;
      player: string;
    }[];
  };
  owners: {
    before: Town;
    after: Town;
  }[];
  pvp: {
    new: boolean;
    town: Town;
  }[];
  nations: {
    before: Town;
    after: Town;
  }[];
}
