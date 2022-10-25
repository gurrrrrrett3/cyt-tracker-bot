import { Client, Colors, Embed, EmbedBuilder, Message, TextChannel } from "discord.js";
import { db } from "../../..";
import Town from "../map/resources/town";

export default class CYTUpdatesMessageManager {
  public statusMssage: Message | null = null;
  public statusChannel: TextChannel | null = null;
  public updatesChannel: TextChannel | null = null;

  constructor(private client: Client) {
    this.loadChannels();
  }

  public async handleUpdate(data: UpdateFrame) {
    if (this.updatesChannel != null) {
      // compile updates

      let changes: (
        | {
            type: "townCreated";
            data: Town;
          }
        | {
            type: "townDestroyed";
            data: Town;
          }
        | {
            type: "assistantAdded";
            data: {
              town: Town;
              player: string;
            };
          }
        | {
            type: "assistantRemoved";
            data: {
              town: Town;
              player: string;
            };
          }
        | {
            type: "residentAdded";
            data: {
              town: Town;
              player: string;
            };
          }
        | {
            type: "residentRemoved";
            data: {
              town: Town;
              player: string;
            };
          }
        | {
            type: "ownerChanged";
            data: {
              before: Town;
              after: Town;
            };
          }
        | {
            type: "pvpChanged";
            data: {
              new: boolean;
              town: Town;
            };
          }
        | {
            type: "nationChanged";
            data: {
              before: Town;
              after: Town;
            };
          }
      )[] = [];

      data.towns.created.forEach((town) => {
        changes.push({
          type: "townCreated",
          data: town,
        });
      });

      data.towns.deleted.forEach((town) => {
        changes.push({
          type: "townDestroyed",
          data: town,
        });
      });

      data.assistants.added.forEach((assistant) => {
        changes.push({
          type: "assistantAdded",
          data: assistant,
        });
      });

      data.assistants.removed.forEach((assistant) => {
        changes.push({
          type: "assistantRemoved",
          data: assistant,
        });
      });

      data.residents.added.forEach((resident) => {
        changes.push({
          type: "residentAdded",
          data: resident,
        });
      });

      data.residents.removed.forEach((resident) => {
        changes.push({
          type: "residentRemoved",
          data: resident,
        });
      });

      data.owners.forEach((owner) => {
        changes.push({
          type: "ownerChanged",
          data: owner,
        });
      });

      data.pvp.forEach((pvp) => {
        changes.push({
          type: "pvpChanged",
          data: pvp,
        });
      });

      // send updates

      changes.forEach((change) => {
        const embed = new EmbedBuilder();

        switch (change.type) {
          case "townCreated":
            embed.setTitle(`Town Created: ${change.data.name}`);
            embed.setDescription(`A new town has been created by ${change.data.mayor}`);
            embed.setColor(Colors.Green);
            embed.addFields(
              {
                name: "Town Name",
                value: change.data.name,
                inline: true,
              },
              {
                name: "Mayor",
                value: change.data.mayor,
                inline: true,
              },
              {
                name: "Coordinates",
                value: `${change.data.world}: ${change.data.coords.x}, ${change.data.coords.z}`,
              }
            );
            break;
          case "townDestroyed":
            embed.setTitle(`Town Destroyed: ${change.data.name}`);
            embed.setDescription(`A town has fallen`);
            embed.setColor(Colors.Red);
            embed.addFields(
              {
                name: "Town Name",
                value: change.data.name,
                inline: true,
              },
              {
                name: "Mayor",
                value: change.data.mayor,
                inline: true,
              },
              {
                name: "Coordinates",
                value: `${change.data.world}: ${change.data.coords.x}, ${change.data.coords.z}`,
              },
              {
                name: "Residents",
                value: `${change.data.residents.length} residents\n${change.data.residents
                  .join(", ")
                  .replace(/_/, "\\_")}`,
              },
              {
                name: "Assistants",
                value: `${change.data.assistants.length} assistants\n${change.data.assistants
                  .join(", ")
                  .replace(/_/, "\\_")}`,
              }
            );
            break;
          case "assistantAdded":
            embed.setTitle(`Assistant Added: ${change.data.town.name}`);
            embed.setDescription(`A new assistant has been added to ${change.data.town.name}`);
            embed.setColor(Colors.Green);
            embed.addFields(
              {
                name: "Town Name",
                value: change.data.town.name,
                inline: true,
              },
              {
                name: "Assistant",
                value: change.data.player,
                inline: true,
              }
            );
            break;
          case "assistantRemoved":
            embed.setTitle(`Assistant Removed: ${change.data.town.name}`);
            embed.setDescription(`An assistant has been removed from ${change.data.town.name}`);
            embed.setColor(Colors.Red);
            embed.addFields(
              {
                name: "Town Name",
                value: change.data.town.name,
                inline: true,
              },
              {
                name: "Assistant",
                value: change.data.player,
                inline: true,
              }
            );
            break;
          case "residentAdded":
            embed.setTitle(`Resident Added: ${change.data.town.name}`);
            embed.setDescription(`A new resident has been added to ${change.data.town.name}`);
            embed.setColor(Colors.Green);
            embed.addFields(
              {
                name: "Town Name",
                value: change.data.town.name,
                inline: true,
              },
              {
                name: "Resident",
                value: change.data.player,
                inline: true,
              }
            );
            break;
          case "residentRemoved":
            embed.setTitle(`Resident Removed: ${change.data.town.name}`);
            embed.setDescription(`A resident has been removed from ${change.data.town.name}`);
            embed.setColor(Colors.Red);
            embed.addFields(
              {
                name: "Town Name",
                value: change.data.town.name,
                inline: true,
              },
              {
                name: "Resident",
                value: change.data.player,
                inline: true,
              }
            );
            break;
          case "ownerChanged":
            embed.setTitle(`Owner Changed: ${change.data.after.name}`);
            embed.setDescription(
              `The owner of ${change.data.after.name} has changed from ${change.data.before.mayor} to ${change.data.after.mayor}`
            );
            embed.setColor(Colors.Yellow);
            break;
          case "pvpChanged":
            embed.setTitle(`PvP Changed: ${change.data.town.name}`);
            embed.setDescription(
              `The PvP status of ${change.data.town.name} has changed from ${!change.data.new} to ${
                change.data.new
              }`
            );
            embed.setColor(Colors.Yellow);
            break;
          case "nationChanged":
            embed.setTitle(`Nation Changed: ${change.data.after.name}`);
            embed.setDescription(
              `The nation of ${change.data.after.name} has changed from ${change.data.before.nation} to ${change.data.after.nation}`
            );
        }

        embed.setTimestamp();

        this.updatesChannel!.send({ embeds: [embed] }).catch((err) => {
          console.error(err);
        });
      });
    }
  }

  private async loadChannels() {
    this.updatesChannel = this.client.channels.cache.get("984683645203779584") as TextChannel;
  }
}
