import { Client } from "discord.js";
import ModuleLoader from "./loaders/moduleLoader";
import CommandLoader from "./loaders/commandLoader";
import ButtonManager from "./loaders/managers/buttonManager";
import SelectMenuManager from "./loaders/managers/selectMenuManager";
import ModalManager from "./loaders/managers/modalManager";
import MapDatabaseManager from "./modules/map/mapDatabaseManager";

export default class Bot {

    public moduleLoader: ModuleLoader
    public commandLoader: CommandLoader

    public buttonManager: ButtonManager
    public selectMenuManager: SelectMenuManager
    public modalManager: ModalManager
  
  constructor(public client: Client) {
    this.client
      .on("ready", () => {
        console.info(`Logged in as ${this.client.user?.tag}`);

      })
    this.moduleLoader = new ModuleLoader(this);
    this.commandLoader = new CommandLoader(this.client);
    
    this.buttonManager = new ButtonManager(this.client);
    this.selectMenuManager = new SelectMenuManager(this.client);
    this.modalManager = new ModalManager(this.client);

    // autocomplete handler

    this.client.on("interactionCreate", async (interaction) => {
      if (!interaction.isAutocomplete()) return

      const autocomplete = interaction.options.getString("player")

      if (!autocomplete) return

      const players = await MapDatabaseManager.searchPlayer(autocomplete, {
        limit: 10,
      })

      if (!players.length) return

      interaction.respond(players.map((player) => {
        return {
          value: player,
          name: player,
        }
      }))
    })
  }

  


}
