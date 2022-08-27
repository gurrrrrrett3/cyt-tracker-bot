import { db } from "../..";
import Util from "./utils";

export default class Query {
  /*
    QUERY STRUCTURE
    
    -- Basic

    in $TABLE where $COL $MATCH $VALUE
    
    -- multi

    in $TABLE include $OBJ $MOD [where $COL $MATCH $VALUE]

    */

  public static DATATYPES = {
    tables: {
      player: ["id", "username", "uuid"],
      town: ["id", "name", "nation", "pvp", "world", "x", "z"],
      session: ["id", "playerId", "loginLocation", "logoutLocation", "startedAt", "endedAt", "isOnline"],
    },
    nonStringValues: [
      {
        table: "session",
        value: "isOnline",
        type: "boolean",
      },
    ],
    matchTypes: [
      "equals",
      "contains",
      "startsWith",
      "endsWith",
      "not",
      //"in",
      //"notIn",
      "lt",
      "lte",
      "gt",
      "gte",
    ],
  };

  public static async suggest(string: string): Promise<string[]> {
    try {
      const data = this.toObject(string.trim());

      const table = data.find((v) => v?.command == "in")?.value;

      const wheres = data
        .map((v, i) => {
          if (v.command == "where") {
            return {
              key: v?.value,
              matchType: data[i + 1]?.command,
              value: data[i + 1]?.value,
            };
          }
        })
        .filter((v) => v != undefined);

      const whereObject: {
        [key: string]: {
          [key: string]: any;
        };
      } = {};

      for (const v of wheres) {
        if (!v || !v.key || !v.value) continue;
        whereObject[v.key] = {
          [v.matchType]: this.fixValue(table || "", v.key, v.value),
        };
      }

      const lastCommand = data[data.length - 1];
      const secondLastCommand = data[data.length - 2];

      console.log(data, lastCommand, `"${string}"`);

      // if the last command is in, but we don't have a valid value, suggest all tables
      if (
        lastCommand.command == "in" &&
        !Object.keys(this.DATATYPES.tables)?.includes(lastCommand.value || "")
      ) {
        console.log("invalid table");
        // @ts-ignore
        return Object.keys(this.DATATYPES.tables).map((v) => this.genString(string, `in ${v}`, "replace"));
      }
      // if the last command is the in command and it's valid, and the user has pressed space, suggest all the keys in the table
      else if (
        lastCommand.command == "in" &&
        Object.keys(this.DATATYPES.tables)?.includes(lastCommand.value || "")
      ) {
        console.log("in table");
        // @ts-ignore
        return this.DATATYPES.tables[table].map((v) => this.genString(string, `where ${v}`, "add"));
      }

      // if last command is where, but we don't have a value yet, suggest all columns
      else if (
        lastCommand?.command == "where" &&
        // @ts-ignore
        (!this.DATATYPES.tables[table]?.includes(lastCommand.value || "") || !lastCommand.value)
      ) {
        console.log("invalid column");
        // @ts-ignore
        return this.DATATYPES.tables[table].map((v: string) => this.genString(string, v, "add"));
      }

      // if last command is where, and we have a value, suggest all the match types
      else if (
        lastCommand?.command == "where" &&
        // @ts-ignore
        this.DATATYPES.tables[table]?.includes(lastCommand.value || "")
      ) {
        console.log("valid column");
        // @ts-ignore
        return this.DATATYPES.matchTypes.map((v) => this.genString(string, v, "add"));
      }

      // last command is an invalid match type, suggest all the match types
      else if (
        secondLastCommand?.command == "where" &&
        // @ts-ignore
        !this.DATATYPES.matchTypes.includes(lastCommand.command)
      ) {
        console.log("invalid match type");
        return this.DATATYPES.matchTypes.map((v) => this.genString(string, v, "replace"));
      }

      // last command is a valid match type, suggest all the values for the match type
      else if (
        secondLastCommand?.command == "where" &&
        this.DATATYPES.matchTypes.includes(lastCommand.command)
      ) {
        console.log("valid match type");
        // @ts-ignore
        const res = await db[table].findMany({
          where: {
            AND: whereObject,
          },
        });

        // @ts-ignore
        const resList: string[] = res.map((v) =>
         // @ts-ignore
          this.genString(string, v[secondLastCommand.value], "replace")
        );

        return Util.removeDuplicates(resList);
      }

      return ["Error, unknown error"];
    } catch (e: any) {
      console.log(e);
      return [e.message];
    }
  }

  public static async query(string: string): Promise<any[] | string> {
    const data = this.toObject(string.trim());

    const table = data.find((v) => v?.command == "in")?.value;

    if (!table) return "Error, you need to specify a table using `in`";

    const wheres = data
      .map((v, i) => {
        if (v.command == "where") {
          return {
            key: v?.value,
            matchType: data[i + 1]?.command,
            value: data[i + 1]?.value,
          };
        }
      })
      .filter((v) => v != undefined);

    const whereObject: {
      [key: string]: {
        [key: string]: any;
      };
    } = {};

    for (const v of wheres) {
      if (!v || !v.key || !v.value) continue;
      whereObject[v.key] = {
        [v.matchType]: this.fixValue(table, v.key, v.value),
      };
    }

    // @ts-ignore
    const res = await db[table].findMany({
      where: {
        AND: whereObject,
      },
    });

    return res
  }

  private static toObject(string: string): {
    command: string;
    value: string | undefined;
  }[] {
    const a = string.split(" ").filter((v) => v != "");

    const out: {
      command: string;
      value: string;
    }[] = [];

    for (let i = 0; i < a.length; i += 2) {
      out.push({
        command: a[i],
        value: a[i + 1],
      });
    }

    return out;
  }

  private static genString(currentString: string, addition: string, mode: "add" | "replace" = "add"): string {
    const a = currentString.trimEnd().split(" ");
    if (mode == "add" || a[a.length - 1] == "") {
      a.push(addition);
    } else {
      a[a.length - 1] = addition;
    }
    return a.join(" ");
  }

  private static fixValue(table: string, key: string, value: string) {
    const dataType = this.DATATYPES.nonStringValues.find((v) => v.table == table && v.value == key);
    if (!dataType) return value;

    switch (dataType.type) {
      case "number":
        return Number(value);
      case "boolean":
        return value == "true";
      case "date":
        return new Date(value);
      default:
        return value;
    }
  }
}

db.player.findMany({
  where: {
    AND: {
      Session: {
        every: {
          AND: {
            
          }
        }
      }
    }
  }
})