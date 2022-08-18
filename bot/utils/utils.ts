import fetch from "node-fetch";
import { db } from "../..";
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
                username
            }
        })

        if (!user || user.uuid.startsWith("Invalid")) {

            if (username.startsWith("BR__")) return `Bedrock-${username}`

            const res = await fetch(`https://playerdb.co/api/player/minecraft/${username}`)
            const json = await res.json()

            const uuid = json.data?.player?.raw_id as string
            if (!uuid) return `Invalid-${username}`

            if (user?.uuid.startsWith("Invalid")) {
                db.player.update({
                    data: {
                        username,
                        uuid
                    },
                    where: {
                        username 
                    }
                })
            } else {
                db.player.create({
                    data: {
                        username,
                        uuid
                    }
                })
            }

            return json.data.player.raw_id as string
        } else {
            return user.uuid
        }

        
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
            time = time.ms()
        } else if (time instanceof Date) {
            time = time.getTime()
        }
        const t = Math.round(time / 1000) 
     
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
        return Math.sqrt(x1^2 + x2^2) + Math.sqrt(z1^2 + z2^2)
      }
}
