import fetch from "node-fetch";
import { db } from "../..";
import Logger from "./logger";
import Time from "./time";

export default class Util {
  public static randomKey(length: number = 10) {
    let result = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  public static async getUUID(username: string) {
    const user = await db.player.findFirst({
      where: {
        username,
      },
    });

    if (!user || user.uuid.startsWith("Invalid")) {

      const res = await fetch(`https://playerdb.co/api/player/minecraft/${username}`);
      const json = await res.json();

      const uuid = json.data?.player?.raw_id as string;
      if (!uuid) return `Invalid-${username}`;

      if (user?.uuid.startsWith("Invalid")) {
        db.player.update({
          data: {
            username,
            uuid,
          },
          where: {
            username,
          },
        });
      } else {
        db.player.create({
          data: {
            username,
            uuid,
          },
        });
      }

      return json.data.player.raw_id as string;
    } else {
      return user.uuid;
    }
  }

  public static async getBatchUUIDs(usernames: string[]) {
    if (usernames.length == 0) return [];
    const res = await fetch(`https://api.mojang.com/profiles/minecraft`, {
      method: "POST",
      body: JSON.stringify(usernames),
      headers: {
        "Content-Type": "application/json",
      },
    }).catch((err) => console.error(err));
    if (!res) return [];
    const json = await res.json().catch((err) => console.error(err));
    if (!json) return [];

    Logger.log("Utils", usernames, json);

    return json as {
      id: string;
      name: string;
    }[];
  }

  public static async getNameFromUUID(uuid: string): Promise<string | undefined> {
    const res = await fetch(`https://playerdb.co/api/player/minecraft/${uuid}`);
    const json = await res.json();
    const username = json.data?.player?.username as string;

    return username;
  }

  public static formatDiscordTime(
    time: number | Time | Date,
    mode:
      | "shortTime"
      | "longTime"
      | "shortDate"
      | "longDate"
      | "shortDateTime"
      | "longDateTime"
      | "relative" = "shortTime"
  ) {
    if (time instanceof Time) {
      time = time.ms();
    } else if (time instanceof Date) {
      time = time.getTime();
    }
    const t = Math.round(time / 1000);

    switch (mode) {
      case "shortTime":
        return `<t:${t}:t>`;
      case "longTime":
        return `<t:${t}:T>`;
      case "shortDate":
        return `<t:${t}:d>`;
      case "longDate":
        return `<t:${t}:D>`;
      case "shortDateTime":
        return `<t:${t}:f>`;
      case "longDateTime":
        return `<t:${t}:F>`;
      case "relative":
        return `<t:${t}:R>`;
      default:
        return `<t:${t}:f>`;
    }
  }

  public static getMapURL(world: string, x: number, z: number, zoom: number = 3) {
    return `https://towny.craftyourtown.com/#${world};flat;${x},64,${z};${zoom}`
  }

  public static kFormat(num: number): string {
    const letters = ["", "K", "M", "B", "T"];
    let i = 0;
    while (num >= 1000) {
      num /= 1000;
      i++;
    }
    return i == 0 ? num.toString() : num.toFixed(2) + letters[i];
  }

  public static distance(x1: number, z1: number, x2: number, z2: number) {
    return Math.sqrt(x1 ^ (2 + x2) ^ 2) + Math.sqrt(z1 ^ (2 + z2) ^ 2);
  }

  public static randomizeArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = 0; i < newArray.length; i++) {
      const j = Math.floor(Math.random() * newArray.length);
      const temp = newArray[i];
      newArray[i] = newArray[j];
      newArray[j] = temp;
    }
    return newArray;
  }

  public static removeDuplicates<T>(array: T[]) {
    return [...new Set(array)];
  }

  public static anyOfArrayIncludes<T = string | any[]>(array: T[], value: T) {
    // @ts-ignore
    return array.some((v) => v.includes(value));
  }

  public static getMatches<T = string | any[]>(array: T[], value: T) {
    // @ts-ignore
    return array.filter((v) => v.includes(value));
  }

  public static formatPlayerName(name: string) {
    return name.replace(/_/g, "\\_");
  }

  public static getColor(str: string) {
    // calculate hash
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    // convert to hex
    let color = "#";
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;
      color += ("00" + value.toString(16)).substr(-2);
    }
    return color;
  }

  public static pagnateString(str: string, seperateAt: string, maxLength: number = 4096) {

    const pages = str.split(seperateAt);
    const paged: string[] = [];
    let currentPage = "";
    for (const page of pages) {
      if (currentPage.length + page.length > maxLength) {
        paged.push(currentPage);
        currentPage = "";
      }
      currentPage += page + seperateAt;
    }
    paged.push(currentPage);
    return paged;
  }
}
