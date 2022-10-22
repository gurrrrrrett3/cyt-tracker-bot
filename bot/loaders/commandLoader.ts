import {
  RESTPostAPIApplicationCommandsJSONBody,
  Routes,
  REST,
  Collection,
  Client,
} from "discord.js";
import Logger from "../utils/logger";
import { CustomCommandBuilder } from "./loaderTypes";

export default class CommandLoader {
  public client: Client;
  public commands: Collection<string, CustomCommandBuilder> = new Collection();

  constructor(client: Client) {
    this.client = client;
  }

  async load(commands: CustomCommandBuilder[]) {
    const applicationId = this.client.application?.id ?? this.client.user?.id ?? "unknown";

    // Collect list of command files
    const commandsToDeploy: RESTPostAPIApplicationCommandsJSONBody[] = [];

    Logger.log("CommandLoader", `Deploying ${commands.length} commands`);

    // Import off of the commands as modules
    for (const command of commands) {
      this.commands.set(command.getName(), command);
      commandsToDeploy.push(command.toJSON());
    }

    const rest = new REST({ version: "10" }).setToken(this.client.token as string ?? process.env.TOKEN as string);

    this.client.application?.commands.set([]);

    // Push to Discord
    if (process.env.MODE == "guild") {
      rest
        .put(Routes.applicationGuildCommands(applicationId, process.env.GUILD_ID as string), {
          body: commandsToDeploy,
        })
        .then(() => {
          Logger.log("CommandLoader", `${this.commands.size} commands deployed`);
        })
        .catch((err) => {
          Logger.error("CommandLoader", err);
        });
    } else {
      rest
        .put(Routes.applicationCommands(applicationId), {
          body: commandsToDeploy,
        })
        .then(() => {
          Logger.log("CommandLoader", `${this.commands.size} commands deployed`);
        })
        .catch((err) => {
          Logger.error("CommandLoader", err);
        });
    }

    // Handle running commands, and direct them to the correct handler function
    this.client.on("interactionCreate", (interaction) => {
      // handle autocomplete
      if (interaction.isAutocomplete()) {
        const command = this.commands.get(interaction.commandName);
        if (command && command.isChatInputCommandHandler()) command.handleAutocomplete(interaction);
      }

      if (!interaction.isCommand()) return; // Ignore non-command interactions
      if (interaction.replied) return; // Ignore interactions that have already been replied to

      const command = this.commands.get(interaction.commandName);
      if (!command) return;

      if (interaction.isChatInputCommand() && command.isChatInputCommandHandler())
        return command.run(interaction);
      if (!interaction.isChatInputCommand() && !command.isChatInputCommandHandler())
        return command.run(interaction as any);
    });
  }

  public unload(commands: CustomCommandBuilder[]) {
    for (const command of commands) {
      this.commands.delete(command.getName());
    }

    this.load(Array.from(this.commands.values()));
  }
}
