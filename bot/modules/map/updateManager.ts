import MapModule from ".";
import Time from "../../utils/time";
import DiscordModule from "../discord";
import MapDatabaseManager from "./mapDatabaseManager";
import Town from "./resources/town";

export default class MapUpdateUpdateManager {
  lastTownData: Town[] = [];
  firstEvent = true;

  constructor() {
    this.init();
  }

  async init() {
    const towns = await MapModule.getMapModule().mm.getTownList();
    this.lastTownData = await MapDatabaseManager.convertTownData(...towns);

    setInterval(async () => {
      await this.updateTowns();
    }, new Time("5 minutes").ms());

    this.updateTowns();
  }

  async updateTowns() {
    // Get the new town data
    const newTowns = await MapModule.getMapModule().mm.getTownList();
    const newTownData = await MapDatabaseManager.convertTownData(...newTowns);

    // Compare the new data to the old data

    let outData: UpdateFrame = {
      towns: {
        created: [],
        deleted: [],
      },
      assistants: {
        added: [],
        removed: [],
      },
      residents: {
        added: [],
        removed: [],
      },
      owners: [],
      pvp: [],
      nations: [],
    };

    // Check if any towns were deleted
    for (const town of this.lastTownData) {
      if (!newTownData.find((t) => t.name == town.name)) {
        // Town was deleted
        outData.towns.deleted.push(town);
      }
    }

    // Check if any towns were created
    for (const town of newTownData) {
      if (!this.lastTownData.find((t) => t.name == town.name)) {
        // Town was created
        outData.towns.created.push(town);
      }
    }

    // Check if any assistants were changed
    for (const town of newTownData) {
      const oldTown = this.lastTownData.find((t) => t.name == town.name);
      if (!oldTown) continue;

      for (const assistant of town.assistants) {
        if (!oldTown.assistants.find((a) => a == assistant)) {
          // Assistant was added
          outData.assistants.added.push({
            town,
            player: assistant,
          });
        } else if (oldTown.assistants.find((a) => a == assistant)) {
          // Assistant was removed
          outData.assistants.removed.push({
            town,
            player: assistant,
          });
        }
      }
    }

    // Check if any residents were changed
    for (const town of newTownData) {
      const oldTown = this.lastTownData.find((t) => t.name == town.name);
      if (!oldTown) continue;

      for (const resident of town.residents) {
        if (!oldTown.residents.find((r) => r == resident)) {
          // Resident was added
          outData.residents.added.push({
            town,
            player: resident,
          });
        } else if (oldTown.residents.find((r) => r == resident)) {
          // Resident was removed
          outData.residents.removed.push({
            town,
            player: resident,
          });
        }
      }
    }

    // Check if pvp was changed
    for (const town of newTownData) {
      const oldTown = this.lastTownData.find((t) => t.name == town.name);
      if (!oldTown) continue;

      if (oldTown.pvp != town.pvp) {
        outData.pvp.push({
          new: town.pvp,
          town,
        });
      }
    }

    // Check if nations were changed
    for (const town of newTownData) {
      const oldTown = this.lastTownData.find((t) => t.name == town.name);
      if (!oldTown) continue;

      if (oldTown.nation != town.nation) {
        outData.nations.push({
          before: oldTown,
          after: town,
        });
      }
    }

    // fire the event, but only if it's not the first time
    if (!this.firstEvent) {
    DiscordModule.getDiscordModule().messageManager!.handleUpdate(outData);
    } else {
      this.firstEvent = false;
    }
  
  }
}
