import { Client } from "discord.js";
import ModuleLoader from "./loaders/moduleLoader";
import CommandLoader from "./loaders/commandLoader";
import ButtonManager from "./loaders/managers/buttonManager";
import SelectMenuManager from "./loaders/managers/selectMenuManager";
import ModalManager from "./loaders/managers/modalManager";

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
  }
}
